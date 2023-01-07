import type { CalculateDataFunction, GPTScoreCalculators } from "../types";

const SGLCalc: CalculateDataFunction<"bms:7K" | "bms:14K"> = (dryScore, chart) => {
	const ecValue = chart.data.sglEC ?? 0;
	const hcValue = chart.data.sglHC ?? 0;

	switch (dryScore.scoreData.lamp) {
		case "FULL COMBO":
		case "EX HARD CLEAR":
		case "HARD CLEAR":
			return Math.max(hcValue, ecValue);
		case "CLEAR":
		case "EASY CLEAR":
			return ecValue;
		default:
			return 0;
	}
};

export const BMS_7K_SCORE_CALC: GPTScoreCalculators["bms:7K"] = {
	sieglinde: SGLCalc,
};

export const BMS_14K_SCORE_CALC: GPTScoreCalculators["bms:14K"] = {
	sieglinde: SGLCalc,
};
