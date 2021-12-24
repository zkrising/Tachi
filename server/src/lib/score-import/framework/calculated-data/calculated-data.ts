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
	[I in IDStrings]: (
		dryScore: DryScore<I>,
		chart: ChartDocument<I>,
		logger: KtLogger
	) => Promise<ScoreDocument<I>["calculatedData"]> | ScoreDocument<I>["calculatedData"];
};

const CalculatedDataFunctions: CalculatedDataFunctions = {
	"iidx:SP": CalculateDataIIDXSP,
	"iidx:DP": CalculateDataIIDXDP,
	"sdvx:Single": CalculateDataSDVXorUSC,
	"popn:9B": CalculateDataPopn,
	"museca:Single": CalculateDataMuseca,
	"chunithm:Single": CalculateDataCHUNITHM,
	"maimai:Single": CalculateDataMaimai,
	"gitadora:Gita": CalculateDataGitadora,
	"gitadora:Dora": CalculateDataGitadora,
	"bms:7K": CalculateDataBMS7K,
	"bms:14K": CalculateDataBMS14K,
	"ddr:SP": CalculateDataDDR,
	"ddr:DP": CalculateDataDDR,
	"usc:Controller": CalculateDataSDVXorUSC,
	"usc:Keyboard": CalculateDataSDVXorUSC,
	"wacca:Single": CalculateDataWACCA,
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
	// @ts-expect-error too many minor complains here...
	return CalculatedDataFunctions[`${game}:${playtype}` as IDStrings](dryScore, chart, logger);
}

type CalculatedData<I extends IDStrings> = Required<ScoreDocument<I>["calculatedData"]>;

function CalculateDataIIDXSP(
	dryScore: DryScore,
	chart: ChartDocument<"iidx:SP">,
	logger: KtLogger
): CalculatedData<"iidx:SP"> {
	let bpi;

	if (chart.data.kaidenAverage && chart.data.worldRecord) {
		bpi = CalculateBPI(
			chart.data.kaidenAverage,
			chart.data.worldRecord,
			dryScore.scoreData.score,
			(chart as ChartDocument<"iidx:SP">).data.notecount * 2,
			chart.data.bpiCoefficient
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

function CalculateDataIIDXDP(
	dryScore: DryScore,
	chart: ChartDocument<"iidx:SP" | "iidx:DP">,
	logger: KtLogger
): CalculatedData<"iidx:DP"> {
	let bpi;

	if (chart.data.kaidenAverage && chart.data.worldRecord) {
		bpi = CalculateBPI(
			chart.data.kaidenAverage,
			chart.data.worldRecord,
			dryScore.scoreData.score,
			(chart as ChartDocument<"iidx:DP">).data.notecount * 2,
			chart.data.bpiCoefficient
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

function CalculateDataMuseca(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"museca:Single"> {
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

function CalculateDataMaimai(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"maimai:Single"> {
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

function CalculateDataPopn(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"popn:9B"> {
	const score = dryScore.scoreData.score;
	const lamp = dryScore.scoreData.lamp;

	if (score <= 50000) {
		return { classPoints: 0 };
	}

	let clearBonus = 0;

	if (lamp === "CLEAR" || lamp === "EASY CLEAR") {
		clearBonus = 3000;
	} else if (lamp === "FULL COMBO" || lamp === "PERFECT") {
		clearBonus = 5000;
	}

	return {
		classPoints: (10_000 * chart.levelNum + score - 50_000 + clearBonus) / 5440,
	};
}
