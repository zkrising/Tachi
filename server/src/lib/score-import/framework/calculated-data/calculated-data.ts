import { KtLogger } from "lib/logger/logger";
import {
	CHUNITHMRating,
	GITADORASkill,
	Jubility,
	PopnClassPoints,
	PoyashiBPI,
	Volforce,
	WACCARate,
} from "rg-stats";
import {
	ChartDocument,
	Game,
	GetGamePTConfig,
	IDStrings,
	Lamps,
	Playtypes,
	ScoreDocument,
} from "tachi-common";
import { DryScore } from "../common/types";
import {
	CalculateKTLampRatingIIDX,
	CalculateKTRating,
	CalculateMFCP,
	CalculateSieglinde,
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
	"iidx:SP": CalculateDataIIDX,
	"iidx:DP": CalculateDataIIDX,
	"sdvx:Single": CalculateDataSDVXorUSC,
	"popn:9B": CalculateDataPopn,
	"museca:Single": CalculateDataMuseca,
	"chunithm:Single": CalculateDataCHUNITHM,
	"maimai:Single": CalculateDataMaimai,
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
	chart: ChartDocument<"iidx:SP" | "iidx:DP">,
	logger: KtLogger
): CalculatedData<"iidx:SP"> {
	let bpi;

	if (chart.data.kaidenAverage && chart.data.worldRecord) {
		bpi = PoyashiBPI.calculate(
			dryScore.scoreData.score,
			chart.data.kaidenAverage,
			chart.data.worldRecord,
			(chart as ChartDocument<"iidx:SP">).data.notecount * 2,
			chart.data.bpiCoefficient
		);

		// kesdc = esd === null ? null : CalculateKESDC(BPIData.kesd, esd); disabled
	} else {
		bpi = null;
	}

	return {
		BPI: bpi,
		ktLampRating: CalculateKTLampRatingIIDX(
			dryScore,
			chart as ChartDocument<"iidx:SP" | "iidx:DP">
		),
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
	logger: KtLogger
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
		skill: GITADORASkill.calculate(dryScore.scoreData.percent, chart.levelNum),
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

export function CalculateDataPMSorBMS(
	dryScore: DryScore,
	chart: ChartDocument,
	logger: KtLogger
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
	logger: KtLogger
): CalculatedData<"wacca:Single"> {
	const rate = WACCARate.calculate(dryScore.scoreData.score, chart.levelNum);

	return { rate };
}

function CalculateDataPopn(
	dryScore: DryScore<"popn:9B">,
	chart: ChartDocument<"popn:9B">,
	logger: KtLogger
): CalculatedData<"popn:9B"> {
	return {
		classPoints: PopnClassPoints.calculate(
			dryScore.scoreData.score,
			dryScore.scoreData.lamp,
			chart.levelNum
		),
	};
}
