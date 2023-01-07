import { PopnClearMedalToLamp } from "../../derivers/games/popn";
import { PopnClassPoints } from "rg-stats";
import type { GPTScoreCalculators } from "../types";

export const POPN_9B_SCORE_CALC: GPTScoreCalculators["popn:9B"] = {
	classPoints: (dryScore, chart) =>
		PopnClassPoints.calculate(
			dryScore.scoreData.score,
			PopnClearMedalToLamp(dryScore.scoreData.clearMedal),
			chart.levelNum
		),
};
