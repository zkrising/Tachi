import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { GPTString, ChartDocument, ScoreRatingAlgorithms } from "tachi-common";

export type CalculateDataFunction<GPT extends GPTString> = (
	dryScore: DryScore<GPT>,
	chart: ChartDocument<GPT>,
	logger: KtLogger
) => number | null;

export type GPTScoreCalculators = {
	[G in GPTString]: Record<ScoreRatingAlgorithms[G], CalculateDataFunction<G>>;
};
