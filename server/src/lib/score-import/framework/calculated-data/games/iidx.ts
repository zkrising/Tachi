import { PoyashiBPI } from "rg-stats";
import type { GPTScoreCalculators, CalculateDataFunction } from "../types";

const BPICalc: CalculateDataFunction<"iidx:DP" | "iidx:SP"> = (dryScore, chart) => {
	if (chart.data.kaidenAverage === null || chart.data.worldRecord === null) {
		return null;
	}

	return PoyashiBPI.calculate(
		dryScore.scoreData.score,
		chart.data.kaidenAverage,
		chart.data.worldRecord,
		chart.data.notecount * 2,
		chart.data.bpiCoefficient
	);
};

export const IIDX_SP_SCORE_CALC: GPTScoreCalculators["iidx:SP"] = {
	BPI: BPICalc,
	ktLampRating: (dryScore, chart) => {
		// if chart has no ncValue, use the rating of the chart instead.
		const ncValue = chart.data.ncTier?.value ?? chart.levelNum;

		// if hc < nc, hcValue = ncValue
		// this means you can't lose score from getting a better clear.
		// same for exhc < hc.
		const hcValue = Math.max(chart.data.hcTier?.value ?? 0, ncValue);
		const exhcValue = Math.max(chart.data.exhcTier?.value ?? 0, hcValue);

		switch (dryScore.scoreData.lamp) {
			case "FULL COMBO":
			case "EX HARD CLEAR":
				return exhcValue;
			case "HARD CLEAR":
				return hcValue;
			case "CLEAR":
				return ncValue;
			default:
				return 0;
		}
	},
};

export const IIDX_DP_SCORE_CALC: GPTScoreCalculators["iidx:DP"] = {
	BPI: BPICalc,
	ktLampRating: (dryScore, chart) => {
		// if chart has no tier, use the rating of the chart instead.
		const ecValue = chart.data.dpTier?.value ?? chart.levelNum;

		switch (dryScore.scoreData.lamp) {
			case "FULL COMBO":
			case "EX HARD CLEAR":
			case "HARD CLEAR":
			case "CLEAR":
			case "EASY CLEAR":
				return ecValue;
			default:
				return 0;
		}
	},
};
