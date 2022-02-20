import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import { HandleOrphanQueue } from "lib/orphan-queue/orphan-queue";
import { ReprocessOrphan } from "lib/score-import/framework/orphans/orphans";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { ChartDocument, SongDocument, Playtypes } from "tachi-common";
import { Random20Hex } from "utils/misc";
import { GetBlacklist } from "utils/queries/blacklist";
import { FindChartOnSHA256, FindChartOnSHA256Playtype } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";
import { BeatorajaChart, BeatorajaContext, BeatorajaScore } from "./types";
const LAMP_LOOKUP = {
	NoPlay: "NO PLAY",
	Failed: "FAILED",
	LightAssistEasy: "ASSIST CLEAR",
	Easy: "EASY CLEAR",
	Normal: "CLEAR",
	Hard: "HARD CLEAR",
	ExHard: "EX HARD CLEAR",
	FullCombo: "FULL COMBO",
	Perfect: "FULL COMBO",
	Max: "FULL COMBO",
} as const;

const RANDOM_LOOKUP = {
	0: "NONRAN",
	1: "MIRROR",
	2: "RANDOM",
	3: "R-RANDOM",
	4: "S-RANDOM",
} as const;

async function HandleOrphanChartProcess(
	game: "bms" | "pms",
	data: BeatorajaScore,
	context: BeatorajaContext,
	logger: KtLogger
) {
	const chartName = `${context.chart.artist} (${context.chart.subartist})- ${context.chart.title} (${context.chart.subtitle})`;

	if (context.chart.hasRandom) {
		// If you're someone forking tachi looking to remove this
		// check, remember to change the entire score import
		// framework and database to be able to handle variable notecounts.
		logger.verbose(`Declined to orphan chart ${chartName} as it has #RANDOM declarations.`);
		throw new InvalidScoreFailure(`${TachiConfig.NAME} will not support #RANDOM charts.`);
	}

	let chart;
	let criteria;

	if (game === "bms") {
		criteria = {
			"chartDoc.data.hashSHA256": context.chart.sha256,
		};

		const idString = context.chart.mode === "BEAT_7K" ? "bms:7K" : "bms:14K";

		const { chartDoc, songDoc } = ConvertBeatorajaChartToTachi(
			context.chart,
			context.chart.mode === "BEAT_7K" ? "7K" : "14K"
		);

		chart = await HandleOrphanQueue(
			idString,
			"bms",
			chartDoc,
			songDoc,
			criteria,
			ServerConfig.BEATORAJA_QUEUE_SIZE,
			context.userID,
			chartName
		);
	} else {
		const playtype = data.deviceType === "BM_CONTROLLER" ? "Controller" : "Keyboard";

		criteria = {
			"chartDoc.data.hashSHA256": context.chart.sha256,
			playtype,
		};

		const idString = playtype === "Controller" ? "pms:Controller" : "pms:Keyboard";

		const { chartDoc, songDoc } = ConvertBeatorajaChartToTachi(context.chart, playtype);

		chart = await HandleOrphanQueue(
			idString,
			"pms",
			chartDoc,
			songDoc,
			criteria,
			ServerConfig.BEATORAJA_QUEUE_SIZE,
			context.userID,
			chartName
		);
	}

	// If chart wasn't unorphaned as a result of this request
	// orphan this score and return ktdnf
	if (!chart) {
		throw new KTDataNotFoundFailure(
			`This chart (${context.chart.artist} - ${context.chart.title}) is orphaned.`,
			"ir/beatoraja",
			data,
			context
		);
	}

	const blacklist = await GetBlacklist();
	const scoresToDeorphan = await db["orphan-scores"].find(criteria);

	await Promise.all(scoresToDeorphan.map((e) => ReprocessOrphan(e, blacklist, logger)));

	return chart;
}

// NOTE: This converter handles both PMS and BMS scores. The two are very similar,
// infact, beatoraja barely does anything different between the two. PMS is essentially
// BMS but with the columns set to 9.
export const ConverterIRBeatoraja: ConverterFunction<BeatorajaScore, BeatorajaContext> = async (
	data,
	context,
	importType,
	logger
) => {
	// ALWAYS USE CHART.LNTYPE, NOT DATA.LNTYPE!
	// beatoraja has a bug where IRScore LNTypes are always set to 0.
	if (context.chart.lntype !== 0) {
		throw new InvalidScoreFailure("CN or HCN mode is not supported by this IR.");
	}

	if (context.chart.hasRandom) {
		throw new InvalidScoreFailure(
			"Charts with #RANDOM declarations are not supported by this IR."
		);
	}

	const game = context.chart.mode === "POPN_9K" ? "pms" : "bms";

	let chart: ChartDocument<"bms:14K" | "bms:7K" | "pms:Controller" | "pms:Keyboard"> | null;

	if (game === "bms") {
		chart = (await FindChartOnSHA256(game, data.sha256)) as ChartDocument<
			"bms:7K" | "bms:14K"
		> | null;
	} else {
		// It's still called BM_CONTROLLER even though its popn!
		const playtype = data.deviceType === "BM_CONTROLLER" ? "Controller" : "Keyboard";

		chart = (await FindChartOnSHA256Playtype(game, data.sha256, playtype)) as ChartDocument<
			"pms:Controller" | "pms:Keyboard"
		> | null;
	}

	if (!chart) {
		chart = await HandleOrphanChartProcess(game, data, context, logger);
	}

	const song = await FindSongOnID(game, chart.songID);

	if (!song) {
		logger.severe(`Song-Chart Desync with ${game} ${chart.chartID}.`);
		throw new InternalFailure(`Song-Chart Desync with ${game} ${chart.chartID}.`);
	}

	const { grade, percent } = GenericGetGradeAndPercent(game, data.exscore, chart);

	const hitMeta: DryScore<
		"bms:7K" | "bms:14K" | "pms:Controller" | "pms:Keyboard"
	>["scoreData"]["hitMeta"] = {
		bp: data.minbp === -1 ? null : data.minbp,
		gauge: data.gauge === -1 ? null : data.gauge,
	};

	for (const k of [
		"ebd",
		"lbd",
		"egd",
		"lgd",
		"egr",
		"lgr",
		"epg",
		"lpg",
		"epr",
		"lpr",
	] as const) {
		hitMeta[k] = data[k];
	}

	hitMeta.epr! += data.ems;
	hitMeta.lpr! += data.lms;

	const judgements = {
		[game === "pms" ? "cool" : "pgreat"]: data.epg + data.lpg,
		great: data.egr + data.lgr,
		good: data.egd + data.lgd,
		bad: data.ebd + data.lbd,
		poor: data.epr + data.lpr + data.ems + data.lms,
	};

	hitMeta.fast = (["ebd", "egr", "epg", "epr", "ems"] as const).reduce((a, e) => a + data[e], 0);
	hitMeta.slow = (["lbd", "lgr", "lpg", "lpr", "lms"] as const).reduce((a, e) => a + data[e], 0);

	let random = null;

	// pms and bms are fine using this randomlookup, except for 14k, which is
	// broken in beatoraja.
	if (chart.playtype !== "14K") {
		random = RANDOM_LOOKUP[data.option];
	}

	const lamp = LAMP_LOOKUP[data.clear];

	const dryScore: DryScore<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller"> = {
		comment: null,
		game,
		importType,
		scoreData: {
			grade,
			percent,
			score: data.exscore,
			lamp,
			hitMeta,
			judgements,
		},
		scoreMeta: {
			client: context.client,
			inputDevice: data.deviceType,
			random,
		},
		timeAchieved: context.timeReceived,
		service: "Beatoraja IR",
	};

	return { song, chart, dryScore };
};

function ConvertBeatorajaChartToTachi(chart: BeatorajaChart, playtype: Playtypes["bms" | "pms"]) {
	const chartDoc: ChartDocument<"bms:14K" | "bms:7K" | "pms:Controller" | "pms:Keyboard"> = {
		chartID: Random20Hex(),
		difficulty: "CHART",
		isPrimary: true,
		level: "?",
		levelNum: 0,
		playtype,
		rgcID: null,
		songID: 0,
		versions: [],
		tierlistInfo: {},
		data: {
			hashMD5: chart.md5,
			hashSHA256: chart.sha256,
			notecount: chart.notes,
			tableFolders: [],
		},
	};

	const songDoc: SongDocument<"bms" | "pms"> = {
		artist: chart.artist,
		title: chart.title,
		id: 0,
		altTitles: [],
		searchTerms: [],
		data: {
			genre: chart.genre,
			subartist: chart.subartist,
			subtitle: chart.subtitle,
			tableString: null,
		},
	};

	return { songDoc, chartDoc };
}
