import type { GAME_CONFIGS, GAME_PT_CONFIGS } from "../config/config";
import type { integer } from "../types";
import type { MatchTypes } from "./batch-manual";
import type {
	ExtractClassValues,
	FixedDifficulties,
	ProfileRatingAlgorithmConfig,
	RatingAlgorithmConfig,
} from "./game-config-utils";
import type { INTERNAL_GAME_PT_CONFIG } from "./internals";
import type { ExtractEnumMetricNames, ExtractMetrics } from "./metrics";
import type { AllFieldsNullableOptional, ExtractArrayElementType } from "./utils";
import type { AnyZodObject, z } from "zod";

/**
 * All the games Tachi supports.
 */
export type Game = keyof typeof GAME_CONFIGS;

/**
 * What game + playtypes does Tachi support? We typically shorten this concept
 * to a "GPT", or Game+Playtype.
 *
 * The keys on the left are the games Tachi supports. The value of those keys
 * are the playtypes that game has.
 *
 * A playtype is a way of splitting a game up into sub, completely separate games.
 * A good example is the difference between IIDX SP and IIDX DP. Although they share
 * songs and a *lot* of logic, they should be completely separate when it comes to
 * storing scores and user profiles.
 *
 * For games that don't really have a meaningful concept of "playtypes", "Single"
 * is the go-to.
 */
export type Playtypes = {
	[G in Game]: typeof GAME_CONFIGS[G]["playtypes"][number];
};

/**
 * Expresses any playtype (for any game). Alias for Playtypes[Game].
 */
export type Playtype = Playtypes[Game];

export type SongDocumentData = {
	[G in Game]: z.infer<typeof GAME_CONFIGS[G]["songData"]>;
};

/**
 * Configuration for the given game. This declares things like its user-facing name
 * and what playtypes it supports.
 */
export interface GameConfig<G extends Game = Game> {
	readonly name: string;
	readonly playtypes: ReadonlyArray<Playtypes[G]>;

	/**
	 * Song documents get their own game-specific record that they use for whatever
	 * they want. IIDX song documents store genres, etc.
	 */
	readonly songData: AnyZodObject;
}

/**
 * GPTStrings are an internal (ish) identifier used to identify Game + Playtype combos.
 *
 * These are used in places where we want to switch over all supported game + playtype
 * combos.
 *
 * The below type magic automatically creates all combinations like iidx:SP, iidx:DP...
 * using the `Playtypes` thing above.
 */
export type GPTString = keyof {
	[G in Game as `${G}:${Playtypes[G]}`]: never;
};

export type GPTStrings = {
	[G in Game]: `${G}:${Playtypes[G]}`;
};

export type GetGameFromGPTString<GPT extends GPTString> = GPT extends `${infer G}:${infer _}`
	? G
	: never;
export type GetPlaytypeFromGPTString<GPT extends GPTString> = GPT extends `${infer _}:${infer PT}`
	? PT
	: never;

// Now that we've got GPTString defined, we can define "lookup types" for things about this GPT.
// For example, if we have a function that works with IIDX's difficulties, we want a type like
// Difficulties["iidx:SP"] which expresses those difficulties.

export type GPTStringToGame = {
	[GPT in GPTString]: GetGameFromGPTString<GPT>;
};

export type GPTStringToPlaytype = {
	[GPT in GPTString]: GetPlaytypeFromGPTString<GPT>;
};

export type Difficulties = {
	// If this game has fixed difficulties, infer what they are
	// otherwise, difficulties are an arbitrary string
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["difficulties"] extends FixedDifficulties<infer D>
		? D
		: string;
};

export type DifficultyConfigs = {
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["difficulties"];
};

export type Judgements = {
	[G in GPTString]: ExtractArrayElementType<typeof GAME_PT_CONFIGS[G]["orderedJudgements"]>;
};

export type Versions = {
	// https://stackoverflow.com/questions/51808160/keyof-inferring-string-number-when-key-is-only-a-string
	[G in GPTString]: string & keyof typeof GAME_PT_CONFIGS[G]["versions"];
};

export type ScoreRatingAlgorithms = {
	[G in GPTString]: string & keyof typeof GAME_PT_CONFIGS[G]["scoreRatingAlgs"];
};

export type SessionRatingAlgorithms = {
	[G in GPTString]: string & keyof typeof GAME_PT_CONFIGS[G]["sessionRatingAlgs"];
};

export type ProfileRatingAlgorithms = {
	[G in GPTString]: string & keyof typeof GAME_PT_CONFIGS[G]["profileRatingAlgs"];
};

export type AnyScoreRatingAlg = ScoreRatingAlgorithms[GPTString];
export type AnySessionRatingAlg = SessionRatingAlgorithms[GPTString];
export type AnyProfileRatingAlg = ProfileRatingAlgorithms[GPTString];

export type ConfProvidedMetrics = {
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["providedMetrics"];
};

export type ConfDerivedMetrics = {
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["derivedMetrics"];
};

export type ConfOptionalMetrics = {
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["optionalMetrics"];
};

export type ConfScoreMetrics = {
	[G in GPTString]: ConfDerivedMetrics[G] & ConfProvidedMetrics[G];
};

export type ExtractedClasses = {
	[G in GPTString]: ExtractClassValues<typeof GAME_PT_CONFIGS[G]["classes"]>;
};

export type AnyClasses = {
	[C in Classes[GPTString]]?: string | null;
};

export type Classes = {
	[G in GPTString]: string & keyof typeof GAME_PT_CONFIGS[G]["classes"];
};

export type ClassConfigs = {
	[G in GPTString]: typeof GAME_PT_CONFIGS[G]["classes"];
};

export type ChartDocumentData = {
	[G in GPTString]: z.infer<typeof GAME_PT_CONFIGS[G]["chartData"]>;
};

export type Preferences = {
	[G in GPTString]: z.infer<typeof GAME_PT_CONFIGS[G]["preferences"]>;
};

export type ScoreMeta = {
	[G in GPTString]: z.infer<typeof GAME_PT_CONFIGS[G]["scoreMeta"]>;
};

export type ProvidedMetrics = {
	[G in GPTString]: ExtractMetrics<typeof GAME_PT_CONFIGS[G]["providedMetrics"]>;
};

export type DerivedMetrics = {
	[G in GPTString]: ExtractMetrics<typeof GAME_PT_CONFIGS[G]["derivedMetrics"]>;
};

/**
 * Top level metrics on a score.
 */
export type ScoreMetrics = {
	[G in GPTString]: DerivedMetrics[G] & ProvidedMetrics[G];
};

export type OptionalMetrics = {
	[G in GPTString]: AllFieldsNullableOptional<
		ExtractMetrics<typeof GAME_PT_CONFIGS[G]["optionalMetrics"]>
	>;
};

/**
 * Alongside strings, we want to store integers to represent the integer value
 * of enums.
 */
export type ScoreEnumIndexes<GPT extends GPTString> = Record<
	ExtractEnumMetricNames<ConfDerivedMetrics[GPT] & ConfProvidedMetrics[GPT]>,
	integer
>;

/**
 * Same as ScoreEnumIndexes but for the optional properties on a score.
 */
export type OptionalEnumIndexes<GPT extends GPTString> = Partial<
	Record<ExtractEnumMetricNames<ConfOptionalMetrics[GPT]>, integer>
>;

/**
 * A generic GamePTConfig. This type is significantly less specific than the
 * "SpecificGamePTConfig", which only really works as a type if you know *what*
 * GamePTConfig you're working with.
 */
export type GamePTConfig = INTERNAL_GAME_PT_CONFIG & {
	defaultScoreRatingAlg: ScoreRatingAlgorithms[GPTString];
	defaultSessionRatingAlg: SessionRatingAlgorithms[GPTString];
	defaultProfileRatingAlg: ProfileRatingAlgorithms[GPTString];
};

/**
 * Configuration for a GPT. This declares *almost everything* about how this game is
 * implemented in Tachi, such as what metrics it supports, how it handles chart
 * difficulties, etc.
 *
 * To get a GamePTConfig for a given Game + Playtype, @see {GetGamePTConfig}
 */
export interface SpecificGamePTConfig<GPT extends GPTString> {
	/**
	 * What metrics **must** be provided in order for this score to be usable by
	 * Tachi?
	 *
	 * This is intended for things like Score, Lamp, etc. Things that quite fundamentally
	 * *are* the metrics of the score.
	 */
	providedMetrics: ConfProvidedMetrics[GPT];

	/**
	 * What metrics do we want to exist on score documents, but don't need to be
	 * provided?
	 *
	 * In simple terms, all of these metrics **MUST** be derivable by a DETERMINISTIC
	 * function of f(mandatoryMetrics, chartThisScoreWasOn).
	 *
	 * This is for convenience/efficiency mainly. A good example would be "percent" for
	 * IIDX. Technically, we could recalculate it every single time we want to display
	 * it by dividing score by chart.data.notecount * 2, but that's horrendously
	 * inefficient.
	 *
	 * Furthermore, since these things are derived deterministically, they only ever
	 * need to be recalculated in extreme circumstances (an IIDX chart has changed its
	 * notecounts!!!). If mandatory metrics were to change, it's just now a different
	 * score.
	 *
	 * Another good example would be "Grade" for most games, as a grade is often just
	 * cutoffs applied on score values.
	 */
	derivedMetrics: ConfDerivedMetrics[GPT];

	/**
	 * What's the default metric for this GPT?
	 *
	 * This will be used to order leaderboard rankings.
	 *
	 * @note This **MUST** be one of the mandatory or derived keys.
	 */
	defaultMetric: keyof ConfDerivedMetrics[GPT] | keyof ConfProvidedMetrics[GPT];

	/**
	 * What's the preferred default enum for this GPT?
	 *
	 * Enum types are used across the UI (think folder breakdown charts), and the game
	 * should generally declare a default.
	 *
	 * @note This **MUST** be one of the mandatory or derived keys.
	 */
	preferredDefaultEnum: ExtractEnumMetricNames<
		ConfDerivedMetrics[GPT] & ConfProvidedMetrics[GPT]
	>;

	/**
	 * What metrics *can* we store about scores, but don't necessarily *need*?
	 *
	 * Of course, in a perfect world we'd store all the metrics always all the time!
	 * But a lot of import methods (eamusement CSV, etc) would be filtered out by
	 * mandating the existence of a lot of these metrics.
	 *
	 * The idea of additionalMetrics allow us to store useful metrics about scores
	 * without necessitating that they exist on arrival. Incredibly convenient.
	 */
	additionalMetrics: ConfOptionalMetrics[GPT];

	/**
	 * What rating algorithms may a score have attached onto it for this GPT?
	 *
	 * @note The implementations for these rating algorithms are handled in the
	 * server config. By defining them here, the typesystem will enforce that you
	 * implement them elsewhere.
	 */
	scoreRatingAlgs: Record<ScoreRatingAlgorithms[GPT], RatingAlgorithmConfig>;

	/**
	 * What rating algorithms may a session have attached onto it for this GPT?
	 *
	 * @note The implementations for these rating algorithms are handled in the
	 * server config. By defining them here, the typesystem will enforce that you
	 * implement them elsewhere.
	 */
	sessionRatingAlgs: Record<SessionRatingAlgorithms[GPT], RatingAlgorithmConfig>;

	/**
	 * What rating algorithms may a profile have attached onto it for this GPT?
	 *
	 * @note This is **SPECIFICALLY** for numeric, calculatable metrics. This means
	 * that the metric *must* be calculatable *at all times* from the set of all
	 * scores this user has on this GPT.
	 *
	 * This is intended for numeric, continous data.
	 * If you want to store something with a fixed set of values, such as a user's
	 * "rating colour", use `supportedClasses`.
	 *
	 * If you want to store something that cannot be derived from the user's scores,
	 * such as their "Dan", use `supportedClasses`.
	 *
	 * @note The implementations for these rating algorithms are handled in the
	 * server config. By defining them here, the typesystem will enforce that you
	 * implement them elsewhere.
	 */
	profileRatingAlgs: Record<ProfileRatingAlgorithms[GPT], ProfileRatingAlgorithmConfig>;

	/**
	 * What classes may a profile have attached onto it for this GPT?
	 *
	 * Classes are a *fixed*, *ordered* set of values.
	 * They may be a function of existing state (like "rating colours", where a user
	 * gets a new discrete colour when they go up certain ratings),
	 * or they may be provided by score imports, such as "dans", which cannot be
	 * derived from a player's scores or profile ratings.
	 */
	classes: ClassConfigs[GPT];

	/**
	 * What's the default score rating algorithm for this GPT?
	 *
	 * @note This should be one of the keys in scoreRatingAlgs.
	 */
	defaultScoreRatingAlg: ScoreRatingAlgorithms[GPT];

	/**
	 * What's the default session rating algorithm for this GPT?
	 *
	 * @note This should be one of the keys in sessionRatingAlgs.
	 */
	defaultSessionRatingAlg: SessionRatingAlgorithms[GPT];

	/**
	 * What's the default profile rating algorithm for this GPT1?
	 *
	 * @note This should be one of the keys in sessionRatingAlgs.
	 */
	defaultProfileRatingAlg: ProfileRatingAlgorithms[GPT];

	/**
	 * How does this GPT handle difficulties?
	 *
	 * "Difficulties" are used to allow one song to have multiple charts. Some games
	 * may have a known set of possible difficulties, such as "Easy", "Normal" and
	 * "Hard".
	 *
	 * Other games may have an unknown set of possible difficulties, such as osu!
	 * allowing any string (as long as its unique.)
	 *
	 */
	difficulties: DifficultyConfigs[GPT];

	/**
	 * What judgements does this GPT have? These are typically timing-window names.
	 *
	 * These should be ordered from **best to worst**.
	 */
	orderedJudgements: ReadonlyArray<Judgements[GPT]>;

	/**
	 * What versions do we support for this GPT?
	 *
	 * The keys are the version names, and the values are a humanised, prettified
	 * form for them.
	 *
	 * Version are the way tachi disambiguates cases (typically in arcade games) where
	 * a chart is modified.
	 * For example, Rising in the Sun
	 * (https://remywiki.com/Rising_in_the_Sun(original_mix))
	 * was removed in IIDX 21, and revived in IIDX 27 with entirely different
	 * charts. Although these charts are completely different,
	 * they use the same song and difficulty
	 * so Rising in the Sun SP ANOTHER could mean two things!.
	 *
	 * We need to handle these cases, so we disambiguate by attaching "chart sets" onto
	 * every chart. These "chart sets" indicate what sets of chart states they
	 * appeared in for this GPT. Then, when a score is coming in, it can indicate what
	 * version this score was on. That way, we can make sure they resolve to the right
	 * chart.
	 */
	versions: Record<Versions[GPT], string>;

	/**
	 * Chart documents get their own GPT-specific record that they use for whatever
	 * they want. IIDX documents store BPI information like kaiden averages, BMS
	 * charts store sha256/md5 hashes, etc.
	 *
	 * This is a zod schema that can be used to validate that input.
	 */
	chartData: AnyZodObject;

	/**
	 * This is a zod schema that can be used to validate provided GPT-specific
	 * preferences.
	 */
	preferences: AnyZodObject;

	/**
	 * What game-specific metadata should be stored on scores for this GPT?
	 *
	 * These are for things like what options were used (RANDOM, MIRROR etc.)
	 * and don't exist on PBs.
	 */
	scoreMeta: AnyZodObject;

	/**
	 * What "matchTypes" should this game support for batch-manual imports? This
	 * allows us to disable things like "songTitle" resolutions for games like BMS,
	 * where song titles are absolutely not guaranteed to be unique.
	 */
	supportedMatchTypes: ReadonlyArray<MatchTypes>;
}
