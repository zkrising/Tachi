import type { DryScore } from "../common/types";
import type {
	GPTString,
	ChartDocument,
	ScoreRatingAlgorithms,
	SessionRatingAlgorithms,
	ScoreDocument,
	GPTStringToGame,
	GPTStringToPlaytype,
	integer,
} from "tachi-common";

export type ScoreCalculator<GPT extends GPTString> = (
	dryScore: DryScore<GPT>,
	chart: ChartDocument<GPT>
) => number | null;

export type SessionCalculator<GPT extends GPTString> = (
	scoreCalcData: Array<ScoreDocument<GPT>["calculatedData"]>
) => number | null;

/**
 * Return a number/null from this players UGPT info. This will involve database queries.
 */
export type ProfileCalculator<GPT extends GPTString> = (
	game: GPTStringToGame[GPT],
	playtype: GPTStringToPlaytype[GPT],
	userID: integer
) => Promise<number | null>;

export type GPTScoreCalculators = {
	[G in GPTString]: Record<ScoreRatingAlgorithms[G], ScoreCalculator<G>>;
};

export type GPTSessionCalculators = {
	[G in GPTString]: Record<SessionRatingAlgorithms[G], SessionCalculator<G>>;
};

export type GPTProfileCalculators = {
	[G in GPTString]: Record<SessionRatingAlgorithms[G], ScoreCalculator<G>>;
};
