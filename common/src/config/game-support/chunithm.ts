import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const CHUNITHM_CONF = {
	defaultPlaytype: "Single",
	name: "CHUNITHM",
	validPlaytypes: ["Single"],
	songData: z.strictObject({
		genre: z.string(),
		displayVersion: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

export const CHUNITHMColours = [
	ClassValue("BLUE", "青", "Blue"),
	ClassValue("GREEN", "緑", "Green"),
	ClassValue("ORANGE", "橙", "Orange"),
	ClassValue("RED", "赤", "Red"),
	ClassValue("PURPLE", "紫", "Purple"),
	ClassValue("COPPER", "銅", "Copper"),
	ClassValue("SILVER", "銀", "Silver"),
	ClassValue("GOLD", "金", "Gold"),
	ClassValue("PLATINUM", "鉑", "Platinum"),
	ClassValue("RAINBOW", "虹", "Rainbow"),
];

export const CHUNITHM_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	scoreRatingAlgs: {
		rating: {
			description:
				"The rating value of this score. This is identical to the system used in game.",
		},
	},
	sessionRatingAlgs: {
		naiveRating: { description: "The average of your best 10 ratings this session." },
	},
	profileRatingAlgs: {
		naiveRating: {
			description:
				"The average of your best 20 ratings. This is different to in-game, as it does not take into account your recent scores in any way.",
		},
	},

	defaultScoreRatingAlg: "rating",
	defaultSessionRatingAlg: "naiveRating",
	defaultProfileRatingAlg: "naiveRating",

	// This game technically has a dynamic set of difficulties, with a chart being
	// able to have as many WORLD'S END charts as it likes. However, this is a little
	// awkward to implement, and I can't be bothered. Sorry!
	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["BASIC", "ADVANCED", "EXPERT", "MASTER"],
		difficultyShorthand: {
			BASIC: "B",
			ADVANCED: "A",
			EXPERT: "E",
			MASTER: "M",
		},
		defaultDifficulty: "MASTER",
	},

	supportedClasses: {
		colour: {
			type: "DERIVED",
			values: CHUNITHMColours,
		},
	},

	orderedJudgements: ["jcrit", "justice", "attack", "miss"],

	chartSets: ["Paradise Lost"],

	chartData: z.strictObject({
		inGameID: zodNonNegativeInt,
	}),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
