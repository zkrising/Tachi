import {
	CalculateKTLampRatingIIDXDP,
	CalculateKTLampRatingIIDXSP,
	CalculateKTRating,
	CalculateMFCP,
	CalculateSieglinde,
} from "./stats";
import {
	CHUNITHMRating,
	GITADORASkill,
	Jubility,
	PopnClassPoints,
	PoyashiBPI,
	Volforce,
	WACCARate,
} from "rg-stats";
import { GetGamePTConfig } from "tachi-common";
import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { ChartDocument, Game, IDStrings, Lamps, Playtypes, ScoreDocument } from "tachi-common";

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

type CalculatedDataFunctionsType = {
	[I in IDStrings]: (
		dryScore: DryScore<I>,
		chart: ChartDocument<I>,
		logger: KtLogger
	) => Promise<ScoreDocument<I>["calculatedData"]> | ScoreDocument<I>["calculatedData"];
};

const CalculatedDataFunctions: CalculatedDataFunctionsType = {
	"iidx:SP": CalculateDataIIDX,
	"iidx:DP": CalculateDataIIDX,
	"sdvx:Single": CalculateDataSDVXorUSC,
	"popn:9B": CalculateDataPopn,
	"museca:Single": CalculateDataMuseca,
	"chunithm:Single": CalculateDataCHUNITHM,
	"maimai:Single": () => ({ ktRating: null }),
	"gitadora:Gita": CalculateDataGitadora,
	"gitadora:Dora": CalculateDataGitadora,
	"bms:7K": CalculateDataPMSorBMS,
	"bms:14K": CalculateDataPMSorBMS,
	"ddr:SP": CalculateDataDDR,
	"ddr:DP": CalculateDataDDR,
	"usc:Controller": CalculateDataSDVXorUSC,
	"usc:Keyboard": CalculateDataSDVXorUSC,
	"wacca:Single": CalculateDataWACCA,
	"jubeat:Single": CalculateDataJubeat,
	"pms:Keyboard": CalculateDataPMSorBMS,
	"pms:Controller": CalculateDataPMSorBMS,
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

function CalculateDataIIDX(
	dryScore: DryScore,
	chart: ChartDocument<"iidx:DP" | "iidx:SP">,
	logger: KtLogger
): CalculatedData<"iidx:SP"> {
	let bpi = null;

	// Legacy check! This can't be undefined now, but it used to be before BPI was
	// migrated to chart.data.
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (chart.data.kaidenAverage === undefined || chart.data.worldRecord === undefined) {
		logger.warn(
			`Chart ${chart.chartID}'s kaidenAverage/worldRecord was undefined. This is not legal, and it should be set to null.`,
			{ chart }
		);
	} else if (chart.data.kaidenAverage !== null && chart.data.worldRecord !== null) {
		bpi = PoyashiBPI.calculate(
			dryScore.scoreData.score,
			chart.data.kaidenAverage,
			chart.data.worldRecord,
			(chart as ChartDocument<"iidx:SP">).data.notecount * 2,
			chart.data.bpiCoefficient
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	}

	const ktLampRating =
		chart.playtype === "SP"
			? CalculateKTLampRatingIIDXSP(dryScore, chart as ChartDocument<"iidx:SP">)
			: CalculateKTLampRatingIIDXDP(dryScore, chart as ChartDocument<"iidx:DP">);

	return {
		BPI: bpi,
		ktLampRating,
	};
}

function CalculateDataSDVXorUSC(
	dryScore: DryScore,
	chart: ChartDocument,
	_logger: KtLogger
): CalculatedData<"sdvx:Single" | "usc:Controller" | "usc:Keyboard"> {
	// for usc, unofficial charts currently have no VF6 value.
	if (
		dryScore.game === "usc" &&
		!(chart as ChartDocument<"usc:Controller" | "usc:Keyboard">).data.isOfficial
	) {
		return { VF6: null };
	}

	const VF6 = Volforce.calculateVF6(
		dryScore.scoreData.score,
		dryScore.scoreData.lamp as Lamps["sdvx:Single"],
		chart.levelNum
	);

	return { VF6 };
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

function CalculateDataJubeat(
	dryScore: DryScore,
	chart: ChartDocument,
	_logger: KtLogger
): CalculatedData<"jubeat:Single"> {
	return {
		jubility: Jubility.calculate(
			dryScore.scoreData.score,
			dryScore.scoreData.percent,
			chart.levelNum
		),
	};
}

function CalculateDataCHUNITHM(
	dryScore: DryScore,
	chart: ChartDocument
): CalculatedData<"chunithm:Single"> {
	return {
		rating: CHUNITHMRating.calculate(dryScore.scoreData.score, chart.levelNum),
	};
}

function CalculateDataGitadora(
	dryScore: DryScore,
	chart: ChartDocument
): CalculatedData<"gitadora:Dora" | "gitadora:Gita"> {
	return {
		skill: GITADORASkill.calculate(dryScore.scoreData.percent, chart.levelNum),
	};
}

function CalculateDataDDR(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
): CalculatedData<"ddr:DP" | "ddr:SP"> {
	return {
		MFCP: CalculateMFCP(dryScore, chart, logger),
		ktRating: CalculateKTRating(dryScore, "ddr", chart.playtype, chart, logger),
	};
}

export function CalculateDataPMSorBMS(
	dryScore: DryScore,
	chart: ChartDocument,
	_logger: KtLogger
): CalculatedData<"pms:Controller" | "pms:Keyboard"> {
	const gptConfig = GetGamePTConfig(dryScore.game, chart.playtype);

	const lampIndex = gptConfig.lamps.indexOf(dryScore.scoreData.lamp);

	return {
		sieglinde: CalculateSieglinde(chart, lampIndex),
	};
}

function CalculateDataWACCA(
	dryScore: DryScore,
	chart: ChartDocument,
	_logger: KtLogger
): CalculatedData<"wacca:Single"> {
	const rate = WACCARate.calculate(dryScore.scoreData.score, chart.levelNum);

	return { rate };
}

function CalculateDataPopn(
	dryScore: DryScore<"popn:9B">,
	chart: ChartDocument<"popn:9B">,
	_logger: KtLogger
): CalculatedData<"popn:9B"> {
	return {
		classPoints: PopnClassPoints.calculate(
			dryScore.scoreData.score,
			dryScore.scoreData.lamp,
			chart.levelNum
		),
	};
}
