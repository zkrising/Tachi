import { FindChartOnSHA256 } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";
import { BeatorajaContext, BeatorajaScore, BeatorajaChart } from "./types";
import { ChartDocument, SongDocument } from "tachi-common";
import { HandleOrphanQueue } from "lib/orphan-queue/orphan-queue";
import { Random20Hex } from "utils/misc";
import { ServerConfig, ServerTypeInfo } from "lib/setup/config";

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
} as const;

const RANDOM_LOOKUP = {
	0: "NONRAN",
	1: "MIRROR",
	2: "RANDOM",
	3: "R-RANDOM",
	4: "S-RANDOM",
} as const;

export const ConverterIRBeatoraja: ConverterFunction<BeatorajaScore, BeatorajaContext> = async (
	data,
	context,
	importType,
	logger
) => {
	if (data.lntype !== 0) {
		throw new InvalidScoreFailure("CN or HCN mode is not supported by this IR.");
	}

	let chart = (await FindChartOnSHA256("bms", data.sha256)) as ChartDocument<
		"bms:7K" | "bms:14K"
	> | null;

	if (!chart) {
		const chartName = `${context.chart.artist} (${context.chart.subartist})- ${context.chart.title} (${context.chart.subtitle})`;

		if (context.chart.hasRandom) {
			// If you're someone forking tachi looking to remove this
			// check, remember to change the entire score import
			// framework and database to be able to handle variable notecounts.
			logger.verbose(`Declined to orphan chart ${chartName} as it has #RANDOM declarations.`);
			throw new InvalidScoreFailure(
				`${ServerTypeInfo.name} will not support #RANDOM charts.`
			);
		}

		const idString = context.chart.mode === "BEAT_7K" ? "bms:7K" : "bms:14K";

		const { chartDoc, songDoc } = ConvertBeatorajaChartToTachi(context.chart);

		chart = await HandleOrphanQueue(
			idString,
			"bms",
			chartDoc,
			songDoc,
			{
				"chartDoc.data.hashSHA256": context.chart.sha256,
			},
			ServerConfig.BEATORAJA_QUEUE_SIZE,
			context.userID,
			chartName
		);

		// If chart wasn't unorphaned as a result of this request
		// orphan this score and return ktdnf
		if (!chart) {
			throw new KTDataNotFoundFailure(
				`This chart is orphaned.`,
				"ir/beatoraja",
				data,
				context
			);
		}
	}

	const song = await FindSongOnID("bms", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart Desync with BMS ${chart.chartID}.`);
		throw new InternalFailure(`Song-Chart Desync with BMS ${chart.chartID}.`);
	}

	const { grade, percent } = GenericGetGradeAndPercent("bms", data.exscore, chart);

	const hitMeta: DryScore<"bms:7K" | "bms:14K">["scoreData"]["hitMeta"] = {
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
		pgreat: data.epg + data.lpg,
		great: data.egr + data.lgr,
		good: data.egd + data.lgd,
		bad: data.ebd + data.lbd,
		poor: data.epr + data.lpr + data.ems + data.lms,
	};

	let random = null;

	if (chart.playtype === "7K") {
		random = RANDOM_LOOKUP[data.option];
	}

	const lamp = LAMP_LOOKUP[data.clear];

	const dryScore: DryScore<"bms:7K" | "bms:14K"> = {
		comment: null,
		game: "bms",
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
		timeAchieved: Date.now(),
		service: "Beatoraja IR",
	};

	return { song, chart, dryScore };
};

function ConvertBeatorajaChartToTachi(chart: BeatorajaChart) {
	const chartDoc: ChartDocument<"bms:14K" | "bms:7K"> = {
		chartID: Random20Hex(),
		difficulty: "CHART",
		isPrimary: true,
		level: "?",
		levelNum: 0,
		playtype: chart.mode === "BEAT_7K" ? "7K" : "14K",
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

	const songDoc: SongDocument<"bms"> = {
		artist: chart.artist,
		title: chart.title,
		id: 0,
		altTitles: [],
		searchTerms: [],
		data: {
			genre: chart.genre,
			subartist: chart.subartist,
			subtitle: chart.subtitle,
		},
	};

	return { songDoc, chartDoc };
}
