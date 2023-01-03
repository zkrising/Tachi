import type { MatchTypes } from "./batch-manual";
import type { ClassConfig, DifficultyConfig, RatingAlgorithmConfig } from "./game-config";
import type { ScoreMetric } from "./metrics";
import type { ZodRawShape } from "zod";

/**
 * This is **NOT** intended for external use.
 *
 * What's the "mold" for a GPT config? All GPT configs *must* satisfy this interface,
 * but aren't necessarily this type (they will be more specific.)
 *
 * @see {GamePTConfig} for the intended-to-use type. This is an *outline* for a GPT
 * config, and has significantly less typesafety.
 *
 * Documentation for this type can be found in `game-support.ts`, which has the
 * GamePTConfig type, which actually has documentation.
 */
export type INTERNAL_GPT_CONFIG = Readonly<{
	providedMetrics: Record<string, ScoreMetric>;

	derivedMetrics: Record<string, ScoreMetric>;

	defaultMetric: string;

	preferredDefaultEnum: string;

	additionalMetrics: Record<string, ScoreMetric>;

	scoreRatingAlgs: Record<string, RatingAlgorithmConfig>;
	sessionRatingAlgs: Record<string, RatingAlgorithmConfig>;
	profileRatingAlgs: Record<string, RatingAlgorithmConfig>;

	supportedClasses: Record<string, ClassConfig>;

	defaultScoreRatingAlg: string;
	defaultSessionRatingAlg: string;
	defaultProfileRatingAlg: string;

	difficultyConfig: DifficultyConfig;

	orderedJudgements: ReadonlyArray<string>;

	chartSets: ReadonlyArray<string>;

	supportedMatchTypes: ReadonlyArray<MatchTypes>;

	chartData: ZodRawShape;
}>;

/**
 * A game config *must* satisfy this, but we don't export this kind of game config.
 *
 * Think of this like a "mold" for a game config, it's gotta be shaped like this,
 * but interacting with the mold is a little too malleable for the rest of the
 * codebase. @see {GameConfig} for the exported version.
 */
export type INTERNAL_GAME_CONFIG<PT extends string = string> = Readonly<{
	name: string;
	validPlaytypes: ReadonlyArray<PT>;
	defaultPlaytype: PT;
	songData: ZodRawShape;
}>;
