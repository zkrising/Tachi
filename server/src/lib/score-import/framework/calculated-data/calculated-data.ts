import {
	ChartDocument,
	Game,
	Playtypes,
	ScoreDocument,
	Grades,
	Lamps,
	IDStrings,
} from "tachi-common";
import db from "external/mongo/db";
import { HasOwnProperty } from "utils/misc";

import { GetDefaultTierlist } from "utils/tierlist";
import { KtLogger } from "lib/logger/logger";
import { DryScore } from "../common/types";
import {
	CalculateCHUNITHMRating,
	CalculateGITADORASkill,
	CalculateBPI,
	CalculateMFCP,
	CalculateKTRating,
	CalculateKTLampRating,
	CalculateVF6,
} from "./stats";

export async function CreateCalculatedData(
	dryScore: DryScore,
	chart: ChartDocument,
	esd: number | null,
	logger: KtLogger
): Promise<ScoreDocument["calculatedData"]> {
	const game = dryScore.game;
	const playtype = chart.playtype;

	const defaultTierlist = await GetDefaultTierlist(game, playtype);
	const defaultTierlistID = defaultTierlist?.tierlistID; // tierlistID | undefined

	const calculatedData = await CalculateDataForGamePT(
		game,
		playtype,
		chart,
		dryScore,
		esd,
		defaultTierlistID,
		logger
	);

	return calculatedData;
}

type CalculatedDataFunctions = {
	[G in Game]: {
		[P in Playtypes[G]]: (
			dryScore: DryScore,
			chart: ChartDocument,
			defaultTierlistID: string,
			logger: KtLogger
		) => Promise<ScoreDocument["calculatedData"]> | ScoreDocument["calculatedData"];
	};
};

const CalculatedDataFunctions: CalculatedDataFunctions = {
	iidx: {
		SP: CalculateDataIIDXSP,
		DP: CalculateDataIIDXDP,
	},
	sdvx: {
		Single: CalculateDataSDVXorUSC,
	},
	// popn: {
	// 	"9B": () => ({}),
	// },
	museca: {
		Single: CalculateDataMuseca,
	},
	chunithm: {
		Single: CalculateDataCHUNITHM,
	},
	maimai: {
		Single: CalculateDataMaimai,
	},
	gitadora: {
		Gita: CalculateDataGitadora,
		Dora: CalculateDataGitadora,
	},
	bms: {
		"7K": CalculateDataBMS7K,
		"14K": CalculateDataBMS14K,
	},
	ddr: {
		SP: CalculateDataDDR,
		DP: CalculateDataDDR,
	},
	// jubeat: {
	// 	Single: CalculateDataJubeat,
	// },
	usc: {
		Single: CalculateDataSDVXorUSC,
	},
};

// Creates Game-Specific calculatedData for the provided game & playtype.
// eslint-disable-next-line require-await
export async function CalculateDataForGamePT<G extends Game>(
	game: G,
	playtype: Playtypes[G],
	chart: ChartDocument,
	dryScore: DryScore,
	// ESD gets specially passed through because it's not part of the DryScore, but
	// can be used for statistics anyway.
	esd: number | null,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<ScoreDocument["calculatedData"]> {
	const GameRatingFns = CalculatedDataFunctions[game];

	if (!HasOwnProperty(GameRatingFns, playtype)) {
		logger.error(
			`Invalid playtype of ${playtype} given for game ${game} in CalculateDataForGamePT, returning an empty object.`
		);
		return {};
	}

	// @ts-expect-error standard game->pt stuff.
	return GameRatingFns[playtype](dryScore, chart, defaultTierlistID, logger);
}

type CalculatedData<I extends IDStrings> = Required<ScoreDocument<I>["calculatedData"]>;

async function CalculateDataIIDXSP(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"iidx:SP">> {
	const BPIData = await db["iidx-bpi-data"].findOne({
		chartID: chart.chartID,
	});

	let bpi;

	if (BPIData) {
		bpi = CalculateBPI(
			BPIData.kavg,
			BPIData.wr,
			dryScore.scoreData.score,
			(chart as ChartDocument<"iidx:DP" | "iidx:SP">).data.notecount * 2,
			BPIData.coef
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	} else {
		bpi = null;
	}

	return {
		BPI: bpi,
		ktRating: await CalculateKTRating(dryScore, "iidx", "SP", chart, logger, defaultTierlistID),
		ktLampRating: await CalculateKTLampRating(dryScore, "iidx", "SP", chart, defaultTierlistID),
	};
}

async function CalculateDataIIDXDP(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"iidx:DP">> {
	const BPIData = await db["iidx-bpi-data"].findOne({
		chartID: chart.chartID,
	});

	let bpi;

	if (BPIData) {
		bpi = CalculateBPI(
			BPIData.kavg,
			BPIData.wr,
			dryScore.scoreData.score,
			(chart as ChartDocument<"iidx:DP" | "iidx:SP">).data.notecount * 2,
			BPIData.coef
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	} else {
		bpi = null;
	}

	return {
		BPI: bpi,
		ktRating: await CalculateKTRating(dryScore, "iidx", "DP", chart, logger, defaultTierlistID),
		ktLampRating: await CalculateKTLampRating(dryScore, "iidx", "DP", chart, defaultTierlistID),
	};
}

function CalculateDataSDVXorUSC(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): CalculatedData<"sdvx:Single" | "usc:Single"> {
	// for usc, unofficial charts currently have no VF6 value.
	if (dryScore.game === "usc" && !(chart as ChartDocument<"usc:Single">).data.isOfficial) {
		return { VF6: null };
	}

	const VF6 = CalculateVF6(
		dryScore.scoreData.grade as Grades["sdvx:Single"],
		dryScore.scoreData.lamp as Lamps["sdvx:Single"],
		dryScore.scoreData.percent,
		chart.levelNum,
		logger
	);

	return {
		VF6,
	};
}

async function CalculateDataMuseca(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"museca:Single">> {
	return {
		ktRating: await CalculateKTRating(
			dryScore,
			"museca",
			"Single",
			chart,
			logger,
			defaultTierlistID
		),
	};
}

function CalculateDataCHUNITHM(
	dryScore: DryScore,
	chart: ChartDocument
): CalculatedData<"chunithm:Single"> {
	return {
		rating: CalculateCHUNITHMRating(dryScore, chart),
	};
}

async function CalculateDataMaimai(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"maimai:Single">> {
	return {
		ktRating: await CalculateKTRating(
			dryScore,
			"maimai",
			"Single",
			chart,
			logger,
			defaultTierlistID
		),
	};
}

function CalculateDataGitadora(
	dryScore: DryScore,
	chart: ChartDocument
): CalculatedData<"gitadora:Gita" | "gitadora:Dora"> {
	return {
		skill: CalculateGITADORASkill(dryScore, chart),
	};
}

async function CalculateDataDDR(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"ddr:SP" | "ddr:DP">> {
	return {
		MFCP: CalculateMFCP(dryScore, chart, logger),
		ktRating: await CalculateKTRating(
			dryScore,
			"ddr",
			chart.playtype,
			chart,
			logger,
			defaultTierlistID
		),
	};
}

export async function CalculateDataBMS14K(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"bms:14K">> {
	return {
		sieglinde: 0, // @todo #33
	};
}

export async function CalculateDataBMS7K(
	dryScore: DryScore,
	chart: ChartDocument,
	defaultTierlistID: string | undefined,
	logger: KtLogger
): Promise<CalculatedData<"bms:7K">> {
	return {
		sieglinde: 0, // @todo #33
	};
}

// async function CalculateDataJubeat(
// 	dryScore: DryScore,
// 	chart: ChartDocument,
// 	defaultTierlistID: string | undefined,
// 	logger: KtLogger
// ): Promise<CalculatedData<"jubeat:Single">> {
// 	return {
// 		jubility: 0, // @todo #163 Jubeat Jubility
// 	};
// }
