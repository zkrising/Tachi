import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, GamePTConfig } from "../../types/internals";

export const JUBEAT_CONF = {
	defaultPlaytype: "Single",
	name: "jubeat",
	playtypes: ["Single"],
	songData: z.strictObject({
		displayVersion: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

const JubeatColours = [
	ClassValue("BLACK", "Black"),
	ClassValue("YELLOW_GREEN", "Yellow-Green"),
	ClassValue("GREEN", "Green"),
	ClassValue("LIGHT_BLUE", "Light Blue"),
	ClassValue("BLUE", "Blue"),
	ClassValue("VIOLET", "Violet"),
	ClassValue("PURPLE", "Purple"),
	ClassValue("PINK", "Pink"),
	ClassValue("ORANGE", "Orange"),
	ClassValue("GOLD", "Gold"),
];

export const JUBEAT_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		musicRate: { type: "DECIMAL" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["E", "D", "C", "B", "A", "S", "SS", "SSS", "EXC"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "musicRate",
	preferredDefaultEnum: "grade",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	scoreRatingAlgs: { jubility: { description: "Jubility as it's implemented in game." } },
	sessionRatingAlgs: {
		jubility: { description: "The average of your best 10 jubilities this session." },
	},
	profileRatingAlgs: {
		jubility: {
			description:
				"Your profile jubility. This takes your best 30 scores on PICK UP songs, and your best 30 elsewhere.",
		},
		naiveJubility: {
			description:
				"A naive version of jubility which just adds together your best 60 scores.",
		},
	},

	defaultScoreRatingAlg: "jubility",
	defaultSessionRatingAlg: "jubility",
	defaultProfileRatingAlg: "jubility",

	difficulties: {
		type: "FIXED",
		order: ["BSC", "ADV", "EXT", "HARD BSC", "HARD ADV", "HARD EXT"],
		shorthand: {
			BSC: "BSC",
			ADV: "ADV",
			EXT: "EXT",
			"HARD BSC": "H. BSC",
			"HARD ADV": "H. ADV",
			"HARD EXT": "H. EXT",
		},
		default: "EXT",
	},

	classes: {
		colour: { type: "DERIVED", values: JubeatColours },
	},

	orderedJudgements: ["perfect", "great", "good", "poor", "miss"],

	versions: [
		"jubeat",
		"ripples",
		"knit",
		"copious",
		"saucer",
		"prop",
		"Qubell",
		"clan",
		"festo",
	],

	chartData: z.strictObject({
		inGameID: z.union([z.array(zodNonNegativeInt), zodNonNegativeInt]),
	}),

	preferences: z.strictObject({ jubilityTarget: z.number() }),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["inGameID", "tachiSongID"],
} as const satisfies GamePTConfig;
