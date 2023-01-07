import { Jubility } from "rg-stats";
import type { GPTScoreCalculators } from "../types";

export const JUBEAT_SCORE_CALC: GPTScoreCalculators["jubeat:Single"] = {
	jubility: (dryScore, chart) =>
		Jubility.calculate(dryScore.scoreData.score, dryScore.scoreData.musicRate, chart.levelNum),
};
