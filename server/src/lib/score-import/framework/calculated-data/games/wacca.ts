import { WACCARate } from "rg-stats";
import type { GPTScoreCalculators } from "../types";

export const WACCA_SCORE_CALC: GPTScoreCalculators["wacca:Single"] = {
	rate: (dryScore, chart) => WACCARate.calculate(dryScore.scoreData.score, chart.levelNum),
};
