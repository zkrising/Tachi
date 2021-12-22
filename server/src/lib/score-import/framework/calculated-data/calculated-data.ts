import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import {
	ChartDocument,
	Game,
	GetGamePTConfig,
	Grades,
	IDStrings,
	IIDX_LAMPS,
	Lamps,
	Playtypes,
	ScoreDocument,
} from "tachi-common";
import { HasOwnProperty } from "utils/misc";
import { DryScore } from "../common/types";
import {
	CalculateBPI,
	CalculateCHUNITHMRating,
	CalculateGITADORASkill,
	CalculateKTLampRatingIIDX,
	CalculateKTRating,
	CalculateMFCP,
	CalculateVF6,
	CalculateWACCARate,
} from "./stats";

export async function CreateCalculatedData(
	dryScore: DryScore,
	chart: ChartDocument,
	esd: number | null,
	logger: KtLogger
): Promise<ScoreDocument["calculatedData"]> {
	const game = dryScore.game;
	const playtype = chart.playtype;

	const calculatedData = await CalculateDataForGamePT(
		game,
		playtype,
		chart,
		dryScore,
		esd,
		logger
	);

	return calculatedData;
}

type CalculatedDataFunctions = {
	[G in Game]: {
		[P in Playtypes[G]]: (
			dryScore: DryScore,
			chart: ChartDocument,
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
		Controller: CalculateDataSDVXorUSC,
		Keyboard: CalculateDataSDVXorUSC,
	},
	wacca: {
		Single: CalculateDataWACCA,
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
	return GameRatingFns[playtype](dryScore, chart, logger);
}

type CalculatedData<I extends IDStrings> = Required<ScoreDocument<I>["calculatedData"]>;

async function CalculateDataIIDXSP(
	dryScore: DryScore,
	chart: ChartDocument,
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
			(chart as ChartDocument<"iidx:SP">).data.notecount * 2,
			BPIData.coef
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	} else {
		bpi = null;
	}

	return {
		BPI: bpi,
		ktLampRating: CalculateKTLampRatingIIDX(dryScore, "SP", chart as ChartDocument<"iidx:SP">),
	};
}

async function CalculateDataIIDXDP(
	dryScore: DryScore,
	chart: ChartDocument,
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
			(chart as ChartDocument<"iidx:DP">).data.notecount * 2,
			BPIData.coef
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	} else {
		bpi = null;
	}

	return {
		BPI: bpi,
		ktLampRating: CalculateKTLampRatingIIDX(dryScore, "DP", chart as ChartDocument<"iidx:DP">),
	};
}

function CalculateDataSDVXorUSC(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"sdvx:Single" | "usc:Keyboard" | "usc:Controller"> {
	// for usc, unofficial charts currently have no VF6 value.
	if (
		dryScore.game === "usc" &&
		!(chart as ChartDocument<"usc:Controller" | "usc:Keyboard">).data.isOfficial
	) {
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
	logger: KtLogger
): Promise<CalculatedData<"museca:Single">> {
	return {
		ktRating: CalculateKTRating(dryScore, "museca", "Single", chart, logger),
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
	logger: KtLogger
): Promise<CalculatedData<"maimai:Single">> {
	// @todo #373 Add maimai rating algorithms.
	return {
		ktRating: 0,
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

function CalculateDataDDR(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"ddr:SP" | "ddr:DP"> {
	return {
		MFCP: CalculateMFCP(dryScore, chart, logger),
		ktRating: CalculateKTRating(dryScore, "ddr", chart.playtype, chart, logger),
	};
}

export function CalculateDataBMS14K(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"bms:14K"> {
	const ecValue = chart.tierlistInfo["sgl-EC"]?.value ?? 0;
	const hcValue = chart.tierlistInfo["sgl-HC"]?.value ?? 0;

	const gptConfig = GetGamePTConfig("bms", "7K");

	const lampIndex = gptConfig.lamps.indexOf(dryScore.scoreData.lamp);

	if (lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return {
			sieglinde: Math.max(hcValue, ecValue),
		};
	} else if (lampIndex >= IIDX_LAMPS.EASY_CLEAR) {
		return {
			sieglinde: ecValue,
		};
	}

	return {
		sieglinde: 0,
	};
}

export function CalculateDataBMS7K(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"bms:7K"> {
	const ecValue = chart.tierlistInfo["sgl-EC"]?.value ?? 0;
	const hcValue = chart.tierlistInfo["sgl-HC"]?.value ?? 0;

	const gptConfig = GetGamePTConfig("bms", "7K");

	const lampIndex = gptConfig.lamps.indexOf(dryScore.scoreData.lamp);

	if (lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return {
			sieglinde: Math.max(hcValue, ecValue),
		};
	} else if (lampIndex >= IIDX_LAMPS.EASY_CLEAR) {
		return {
			sieglinde: ecValue,
		};
	}

	return {
		sieglinde: 0,
	};
}

// async function CalculateDataJubeat(
// 	dryScore: DryScore,
// 	chart: ChartDocument,
// 	logger: KtLogger
// ): Promise<CalculatedData<"jubeat:Single">> {
// 	return {
// 		jubility: 0, // @todo #163 Jubeat Jubility
// 	};
// }

function CalculateDataWACCA(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"wacca:Single"> {
	const rate = CalculateWACCARate(dryScore.scoreData.score, chart.levelNum);

	return { rate };
}
