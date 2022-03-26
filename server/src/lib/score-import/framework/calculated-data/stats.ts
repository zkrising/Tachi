import { KtLogger } from "lib/logger/logger";
import { ChartDocument, Game, GetGamePTConfig, IIDX_LAMPS, integer, Playtypes } from "tachi-common";
import { DryScore } from "../common/types";

/**
 * Calculate Marvelous Full Combo Points. This algorithm
 * is used in LIFE4, and described here:
 * https://life4ddr.com/requirements/#mfcpoints
 * @returns Null if this score was not eligible, a number otherwise.
 */
export function CalculateMFCP(dryScore: DryScore, chartData: ChartDocument, logger: KtLogger) {
	if (dryScore.scoreData.lamp !== "MARVELOUS FULL COMBO") {
		return null;
	}

	// Beginner and BASIC scores are explicitly excluded.
	if (chartData.difficulty === "BEGINNER" || chartData.difficulty === "BASIC") {
		return null;
	}

	if (chartData.levelNum < 8) {
		return null;
	} else if (chartData.levelNum <= 10) {
		return 1;
	} else if (chartData.levelNum <= 12) {
		return 2;
	} else if (chartData.levelNum === 13) {
		return 4;
	} else if (chartData.levelNum === 14) {
		return 8;
	} else if (chartData.levelNum === 15) {
		return 15;
	} else if (chartData.levelNum >= 16) {
		return 25;
	}

	logger.warn(
		`Invalid levelNum passed to MFCP ${chartData.levelNum}. ChartID ${chartData.chartID}.`
	);

	// failsafe
	return null;
}

interface RatingParameters {
	failHarshnessMultiplier: number;
	pivotPercent: number;
	clearExpMultiplier: number;
}

// Generic Rating Calc that is guaranteed to work for everything. This is unspecialised, and not great.
function KTRatingCalcV1(
	percent: number,
	levelNum: number,
	parameters: RatingParameters,
	logger: KtLogger
) {
	const percentDiv100 = percent / 100;

	if (percentDiv100 < parameters.pivotPercent) {
		return RatingCalcV0Fail(percentDiv100, levelNum, parameters);
	}

	return RatingCalcV1Clear(percentDiv100, levelNum, parameters, logger);
}

function RatingCalcV1Clear(
	percentDiv100: number,
	levelNum: number,
	parameters: RatingParameters,
	logger: KtLogger
) {
	// https://www.desmos.com/calculator/hn7uxjmjkc

	const rating =
		Math.cosh(
			parameters.clearExpMultiplier * levelNum * (percentDiv100 - parameters.pivotPercent)
		) +
		(levelNum - 1);

	// checks for Infinity or NaN. I'm not sure how this would happen, but it's a failsafe.
	if (!Number.isFinite(rating)) {
		logger.warn(
			`Percent: ${percentDiv100}, Level: ${levelNum} resulted in rating of ${rating}, which is invalid. Defaulting to 0.`
		);
		return 0;
	} else if (rating > 1000) {
		logger.warn(
			`Percent: ${percentDiv100}, Level: ${levelNum} resulted in rating of ${rating}, which is invalid (> 1000). Defaulting to 0.`
		);
		return 0;
	}

	return rating;
}

function RatingCalcV0Fail(percentDiv100: number, levelNum: number, parameters: RatingParameters) {
	// https://www.desmos.com/calculator/hn7uxjmjkc
	return (
		percentDiv100 ** (parameters.failHarshnessMultiplier * levelNum) *
		(levelNum / parameters.pivotPercent ** (parameters.failHarshnessMultiplier * levelNum))
	);
}

const ratingParameters = {
	iidx: {
		failHarshnessMultiplier: 0.3,
		pivotPercent: 0.7777, // Grade: AA
		clearExpMultiplier: 1,
	},
	bms: {
		failHarshnessMultiplier: 0.5,
		pivotPercent: 0.7777, // Grade: AA
		clearExpMultiplier: 0.75,
	},
	museca: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8, // grade: not fail
		clearExpMultiplier: 1, // no real reason
	},
	maimai: {
		failHarshnessMultiplier: 1,
		pivotPercent: 0.8,
		clearExpMultiplier: 1,
	},
	ddr: {
		failHarshnessMultiplier: 0.9,
		pivotPercent: 0.9,
		clearExpMultiplier: 1,
	},
};

export function CalculateKTRating(
	dryScore: DryScore,
	game: "ddr" | "museca",
	playtype: Playtypes[Game],
	chart: ChartDocument,
	logger: KtLogger
) {
	const parameters = ratingParameters[game];

	const levelNum = chart.levelNum;

	return KTRatingCalcV1(dryScore.scoreData.percent, levelNum, parameters, logger);
}

export function CalculateKTLampRatingIIDXSP(dryScore: DryScore, chart: ChartDocument<"iidx:SP">) {
	const ncValue = chart.tierlistInfo["kt-NC"]?.value ?? 0;
	const hcValue = Math.max(chart.tierlistInfo["kt-HC"]?.value ?? 0, ncValue);
	const exhcValue = Math.max(chart.tierlistInfo["kt-EXHC"]?.value ?? 0, hcValue);

	if (!exhcValue && !hcValue && !ncValue) {
		return LampRatingNoTierlistInfo(dryScore, "iidx", chart.playtype, chart);
	}

	const lamp = dryScore.scoreData.lamp;

	const gptConfig = GetGamePTConfig("iidx", chart.playtype);

	const lampIndex = gptConfig.lamps.indexOf(lamp);

	if (exhcValue && lampIndex >= IIDX_LAMPS.EX_HARD_CLEAR) {
		return exhcValue;
	} else if (hcValue && lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return hcValue;
	} else if (ncValue && lampIndex >= IIDX_LAMPS.CLEAR) {
		return ncValue;
	}

	return 0;
}

export function CalculateKTLampRatingIIDXDP(dryScore: DryScore, chart: ChartDocument<"iidx:DP">) {
	const tierlistValue = chart.tierlistInfo["dp-tier"]?.value ?? 0;

	if (!tierlistValue) {
		return LampRatingNoTierlistInfo(dryScore, "iidx", chart.playtype, chart);
	}

	const lamp = dryScore.scoreData.lamp;

	const gptConfig = GetGamePTConfig("iidx", chart.playtype);

	const lampIndex = gptConfig.lamps.indexOf(lamp);

	if (lampIndex >= IIDX_LAMPS.CLEAR) {
		return tierlistValue;
	}

	return 0;
}

function LampRatingNoTierlistInfo(
	dryScore: DryScore,
	game: Game,
	playtype: Playtypes[Game],
	chart: ChartDocument
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const lamps = gptConfig.lamps;

	const CLEAR_LAMP_INDEX = lamps.indexOf(gptConfig.clearLamp);

	// if this is a clear
	if (lamps.indexOf(dryScore.scoreData.lamp) >= CLEAR_LAMP_INDEX) {
		// return this chart's numeric level as the lamp rating
		return chart.levelNum;
	}

	// else, this score is worth 0.
	return 0;
}

export function CalculateSieglinde(chart: ChartDocument, lampIndex: integer) {
	const ecValue = chart.tierlistInfo["sgl-EC"]?.value ?? 0;
	const hcValue = chart.tierlistInfo["sgl-HC"]?.value ?? 0;

	if (lampIndex >= IIDX_LAMPS.HARD_CLEAR) {
		return Math.max(hcValue, ecValue);
	} else if (lampIndex >= IIDX_LAMPS.EASY_CLEAR) {
		return ecValue;
	}

	return 0;
}
