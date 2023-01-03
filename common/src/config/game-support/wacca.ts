import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const WACCA_CONF = {
	defaultPlaytype: "Single",
	name: "WACCA",
	validPlaytypes: ["Single"],
	songData: {
		titleJP: z.string(),
		artistJP: z.string(),
		genre: z.string(),
		displayVersion: z.nullable(z.string()),
	},
} as const satisfies INTERNAL_GAME_CONFIG;

export const WaccaStageUps = [
	ClassValue("I", "I"),
	ClassValue("II", "II"),
	ClassValue("III", "III"),
	ClassValue("IV", "IV"),
	ClassValue("V", "V"),
	ClassValue("VI", "VI"),
	ClassValue("VII", "VII"),
	ClassValue("VIII", "VIII"),
	ClassValue("IX", "IX"),
	ClassValue("X", "X"),
	ClassValue("XI", "XI"),
	ClassValue("XII", "XII"),
	ClassValue("XIII", "XIII"),
	ClassValue("XIV", "XIV"),
];

export const WaccaColours = [
	ClassValue("ASH", "Ash"),
	ClassValue("NAVY", "Navy"),
	ClassValue("YELLOW", "Yellow"),
	ClassValue("RED", "Red"),
	ClassValue("PURPLE", "Purple"),
	ClassValue("BLUE", "Blue"),
	ClassValue("SILVER", "Silver"),
	ClassValue("GOLD", "Gold"),
	ClassValue("RAINBOW", "Rainbow"),
];

export const WACCA_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "MISSLESS", "FULL COMBO", "ALL MARVELOUS"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: [
				"D",
				"C",
				"B",
				"A",
				"AA",
				"AAA",
				"S",
				"S+",
				"SS",
				"SS+",
				"SSS",
				"SSS+",
				"MASTER",
			],
			minimumRelevantValue: "S",
		},
	},

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	scoreRatingAlgs: {
		rate: {
			description: "Rating as it's implemented in game.",
		},
	},
	profileRatingAlgs: {
		naiveRate: {
			description: "A naive rating algorithm that just sums your 50 best scores.",
		},
		rate: {
			description:
				"Rating as it's implemented in game, taking 15 scores from the latest version and 35 from all old versions.",
		},
	},
	sessionRatingAlgs: {
		rate: { description: "The average of your best 10 ratings this session." },
	},

	defaultScoreRatingAlg: "rate",
	defaultProfileRatingAlg: "naiveRate",
	defaultSessionRatingAlg: "rate",

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["NORMAL", "HARD", "EXPERT", "INFERNO"],
		difficultyShorthand: {
			NORMAL: "NRM",
			HARD: "HRD",
			EXPERT: "EXP",
			INFERNO: "INF",
		},
		defaultDifficulty: "EXPERT",
	},

	supportedClasses: {
		stageUp: {
			type: "PROVIDED",
			values: WaccaStageUps,
		},
		colour: {
			type: "DERIVED",
			values: WaccaColours,
		},
	},

	orderedJudgements: ["marvelous", "great", "good", "miss"],

	chartSets: ["REVERSE"],

	chartData: {
		isHot: z.boolean(),
	},

	supportedMatchTypes: ["songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
