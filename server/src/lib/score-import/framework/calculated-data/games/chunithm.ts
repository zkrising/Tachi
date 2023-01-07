import { CHUNITHMRating } from "rg-stats";
import type { GPTScoreCalculators } from "../types";

export const CHUNITHM_SCORE_CALC: GPTScoreCalculators["chunithm:Single"] = {
	rating: (dryScore, chart) => CHUNITHMRating.calculate(dryScore.scoreData.score, chart.levelNum),
};
