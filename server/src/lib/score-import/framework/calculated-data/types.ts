import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type {
	ChartDocument,
	ClassConfigs,
	GPTString,
	GPTStringToGame,
	GPTStringToPlaytype,
	ProfileRatingAlgorithms,
	ScoreDocument,
	ScoreRatingAlgorithms,
	SessionRatingAlgorithms,
	UserGameStats,
	integer,
} from "tachi-common";
import type { DerivedClassConfig, ProvidedClassConfig } from "tachi-common/types/game-config-utils";

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
	[G in GPTString]: Record<ProfileRatingAlgorithms[G], ProfileCalculator<G>>;
};

export type ClassDeriver<GPT extends GPTString, V extends string> = (
	profileRatings: UserGameStats<GPT>["ratings"]
) => V | null;

// absolutely stupid magic.

// makes a record of all the classes that are derivable,
// and returns a ClassDeriver function for each: i.e.
// wacca has StageUP which is not derivable, and colour (which is)
// so this type will result in
// {
//     colour: ClassDeriver<"YELLOW" | "asdf" ...>
// }
type RecordClassDeriver<GPT extends GPTString> = {
	[C in keyof ClassConfigs[GPT] as ClassConfigs[GPT][C] extends DerivedClassConfig
		? C
		: never]: ClassConfigs[GPT][C] extends DerivedClassConfig<infer V>
		? ClassDeriver<GPT, V>
		: never;
};

type RecordClassProvider<GPT extends GPTString> = {
	[C in keyof ClassConfigs[GPT] as ClassConfigs[GPT][C] extends DerivedClassConfig
		? C
		: never]: ClassConfigs[GPT][C] extends ProvidedClassConfig<infer V> ? V : never;
};

export type GPTClassDerivers = {
	[GPT in GPTString]: RecordClassDeriver<GPT>;
};

export type ClassProvider<GPT extends GPTString = GPTString> = (
	gptString: GPT,
	userID: integer,
	ratings: Record<string, number | null>,
	logger: KtLogger
) => Partial<RecordClassProvider<GPT>> | Promise<Partial<RecordClassProvider<GPT>>> | undefined;
