export interface RatingAlgorithmConfig {
	/**
	 * Write a short descrption for this rating algorithm.
	 */
	description: string;

	/**
	 * Normally, Tachi will format the result of all rating algorithms in the UI
	 * to two decimal places. However, you may wish to override that functionality
	 * for this algorithm.
	 */
	formatter?: (value: number) => string;
}

export interface TierlistConfig {
	/**
	 * Write a short description explaining what this tierlist is and what the values
	 * generally mean.
	 */
	description: string;
}

export interface ClassInfo {
	display: string;
	id: string;
	hoverText?: string;
}

interface BaseClassConfig {
	/**
	 * What are the possible values for this class field? This should be in
	 * ascending order.
	 */
	values: Array<ClassInfo>;
}

/**
 * This class can only change via imports explicitly stating that this user has this
 * class value.
 *
 * An example of this would be "dan ranking". Since this isn't a function of Tachi
 * state (i.e. you can't derive it from a user's scores or profile), this is "PROVIDED"
 * class, as the import asserts it exists.
 *
 * @note "PROVIDED" classes will never decrease in value. Even if an import asserts that
 * the user is 3rd dan when they've cleared 5th dan in the past, this value will not go
 * back down at any point.
 */
export interface ProvidedClassConfig extends BaseClassConfig {
	type: "PROVIDED";
}

/**
 * This class is always derived a user's state on this GPT.
 *
 * An example of this would be "jubility colours". These are a function of a user's
 * "jubility" profile metric, and therefore are always derived when a new import comes
 * in.
 *
 * @note "DERIVED" classes are always downgradable, as they are a function of state
 * and might go down at any time for any reason.
 */
export interface DerivedClassConfig extends BaseClassConfig {
	type: "DERIVED";
}

export type ClassConfig = DerivedClassConfig | ProvidedClassConfig;

export interface DynamicDifficulties {
	/**
	 * This game's difficulty names are arbitrary (unique) strings. This makes sense
	 * for a lot of home games, where a song may have any number of difficulties
	 * attached onto it that we want to care for (think osu!).
	 */
	type: "DYNAMIC";
}

export interface FixedDifficulties<Difficulty extends string> {
	/**
	 * The amount of difficulties that may belong to a song is a fixed possible set.
	 *
	 * For example, if the game only ever supports Easy, Normal and Hard difficulties
	 * this would be static.
	 *
	 * If the game was more like osu!, where a song can have arbitrary unique strings
	 * as difficulty names, you want "DYNAMIC" instead.
	 */
	type: "FIXED";

	/**
	 * What order should these difficulties appear in?
	 */
	difficultyOrder: ReadonlyArray<Difficulty>;

	/**
	 * For mobile view (and certain pages where things are generally smaller)
	 * how should we shorten these difficulty names?
	 *
	 * For example, in IIDX "ANOTHER" is generally shortened to "A".
	 */
	difficultyShorthand: Partial<Record<Difficulty, string>>;

	/**
	 * When you click on a song with no difficulty, what should it default to?
	 *
	 * @note If the song doesn't have this difficulty, it will pick in an
	 * undefined order.
	 *
	 * i.e. the default difficulty is "ANOTHER" and the song has no "ANOTHER" available,
	 * then it will just pick something at random that still belongs to that chart.
	 */
	defaultDifficulty: Difficulty;
}

export type DifficultyConfig<D extends string = string> =
	| DynamicDifficulties
	| FixedDifficulties<D>;
