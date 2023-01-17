import type { DryScoreData } from "lib/score-import/framework/common/types";
import type { PBScoreDocumentNoRank } from "lib/score-import/framework/pb/create-pb-doc";
import type {
	ChartDocument,
	ClassConfigs,
	ConfDerivedMetrics,
	ConfScoreMetrics,
	GPTString,
	GPTStringToGame,
	GPTStringToPlaytype,
	PBReference,
	PBScoreDocument,
	ProfileRatingAlgorithms,
	ScoreDocument,
	ScoreRatingAlgorithms,
	SessionRatingAlgorithms,
	SpecificUserGameStats,
	integer,
} from "tachi-common";
import type { DerivedClassConfig } from "tachi-common/types/game-config-utils";
import type {
	AllConfMetrics,
	ConfEnumScoreMetric,
	ScoreMetricDeriver,
} from "tachi-common/types/metrics";

/**
 * Validate this chart-specific metric. This should return a string representing an
 * error message on failure, and null on success.
 */
export type ChartSpecificMetricValidator<GPT extends GPTString> = (
	metric: number,
	chart: ChartDocument<GPT>
) => string | true;

interface ChartDependentMax {
	chartDependentMax: true;
}

export type ScoreCalculator<GPT extends GPTString> = (
	scoreData: DryScoreData<GPT>,
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

export type GPTScoreCalculators<GPT extends GPTString> = {
	[S in ScoreRatingAlgorithms[GPT]]: ScoreCalculator<GPT>;
};

export type GPTSessionCalculators<GPT extends GPTString> = {
	[S in SessionRatingAlgorithms[GPT]]: SessionCalculator<GPT>;
};

export type GPTProfileCalculators<GPT extends GPTString> = {
	[S in ProfileRatingAlgorithms[GPT]]: ProfileCalculator<GPT>;
};

export type ClassDeriver<GPT extends GPTString, V extends string> = (
	profileRatings: SpecificUserGameStats<GPT>["ratings"]
) => V | null | undefined;

// absolutely stupid magic.

// makes a record of all the classes that are derivable,
// and returns a ClassDeriver function for each: i.e.
// wacca has StageUP which is not derivable, and colour (which is)
// so this type will result in
// {
//     colour: ClassDeriver<"YELLOW" | "asdf" ...>
// }
export type GPTClassDerivers<GPT extends GPTString> = {
	[C in keyof ClassConfigs[GPT] as ClassConfigs[GPT][C] extends DerivedClassConfig
		? C
		: never]: ClassConfigs[GPT][C] extends DerivedClassConfig<infer V>
		? ClassDeriver<GPT, V>
		: never;
};

/**
 * A PBMergeFunction just gets the user for this score and the chart its on.
 * They are expected to mutate the existingPB to add/change whatever
 * properties they feel like should be merged.
 *
 * @note Don't worry about updating enumIndexes. Those are updated for you.
 *
 * They should then return some information (a name and a scoreID) to indicate
 * what this PB is composed of.
 */
export type PBMergeFunction<GPT extends GPTString> = (
	userID: integer,
	chartID: string,
	asOfTimestamp: number | null,
	existingPB: PBScoreDocumentNoRank<GPT>
) => Promise<PBReference | null>;

/**
 * The only metrics that need validators are those that have `chartDependentMax` set.
 * Otherwise, a validator is built into the ConfScoreMetric.
 */
export type GPTMetricValidators<GPT extends GPTString> = {
	[M in keyof AllConfMetrics[GPT] as AllConfMetrics[GPT][M] extends ChartDependentMax
		? M
		: never]: ChartSpecificMetricValidator<GPT>;
};

export type GPTDerivers<GPT extends GPTString> = {
	// @ts-expect-error This *might* be a bug in the typescript compiler
	// as this works for all GPT inputs normally.
	// Possibly some generic nonsense but like...

	// can you really blame them for this not working?
	// can you? LOOK at what we're doing.
	[K in keyof ConfDerivedMetrics[GPT]]: ScoreMetricDeriver<ConfDerivedMetrics[GPT][K], GPT>;
};

/**
 * Format a goal into a string. If a function is provided, it's called with this goals
 * criteria value, so a goal of "get 3600 on $CHART" would recieve 3600 as its
 * argument.
 */
export type GoalCriteriaFormatter = (num: number) => string;

/**
 * A record of all non-enum metrics that need formatters. Enums *always* get formatted
 * into their string formats.
 */
export type GPTGoalFormatters<GPT extends GPTString> = {
	[K in keyof ConfScoreMetrics[GPT] as ConfScoreMetrics[GPT][K] extends ConfEnumScoreMetric<
		infer _
	>
		? never
		: K]: GoalCriteriaFormatter;
};

/**
 * Given a user's PB and the value of the goal, return a string representing this
 * user's progress through this goal.
 *
 * This only applies to "single" goals, i.e. goals on a single chart.
 */
export type GoalProgressFormatter<GPT extends GPTString> = (
	pb: PBScoreDocument<GPT>,
	goalValue: integer
) => string;

export type GPTGoalProgressFormatters<GPT extends GPTString> = {
	[K in keyof ConfScoreMetrics[GPT]]: GoalProgressFormatter<GPT>;
};

export interface GPTServerImplementation<GPT extends GPTString> {
	validators: GPTMetricValidators<GPT>;
	derivers: GPTDerivers<GPT>;
	scoreCalcs: GPTScoreCalculators<GPT>;
	sessionCalcs: GPTSessionCalculators<GPT>;
	profileCalcs: GPTProfileCalculators<GPT>;
	classDerivers: GPTClassDerivers<GPT>;

	/**
	 * When creating a goal, how should we format the title?
	 *
	 * Get a score of 1234 on 5.1.1 SP ANOTHER
	 * ^^^^^^^^^^^^^^^^^^^^^^
	 * this bit
	 */
	goalCriteriaFormatters: GPTGoalFormatters<GPT>;

	/**
	 * How should we format the "outOf" part of a goal?
	 *
	 * HARD CLEAR/FULL COMBO
	 *             ^^^^^^^^
	 *              this bit
	 */
	goalOutOfFormatters: GPTGoalFormatters<GPT>;

	/**
	 * How should we format the progress on a goal?
	 *
	 * HARD CLEAR/FULL COMBO
	 *  ^^^^^^^^
	 *   this bit
	 */
	goalProgressFormatters: GPTGoalProgressFormatters<GPT>;

	/**
	 * How should we mutate PBs (to join best lamps, lowest BPs, etc.) for this GPT?
	 */
	pbMergeFunctions: Array<PBMergeFunction<GPT>>;

	/**
	 * A PB is always initialised with the best score for this game's default
	 * metric. What should that be called?
	 */
	defaultMergeRefName: string;
}

export type GPTImplementations = {
	[GPT in GPTString]: GPTServerImplementation<GPT>;
};
