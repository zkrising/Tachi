import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ToDecimalPlaces } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const USC_CONF = {
	defaultPlaytype: "Controller",
	name: "USC",
	validPlaytypes: ["Controller", "Keyboard"],
} as const satisfies INTERNAL_GAME_CONFIG;

export const USC_CONTROLLER_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			values: [
				"FAILED",
				"CLEAR",
				"EXCESSIVE CLEAR",
				"ULTIMATE CHAIN",
				"PERFECT ULTIMATE CHAIN",
			],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S", "PUC"],
			minimumRelevantValue: "A+",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	scoreRatingAlgs: {
		VF6: {
			description: "VOLFORCE as it is implemented in SDVX6.",
			formatter: ToDecimalPlaces(3),
		},
	},
	sessionRatingAlgs: {
		VF6: {
			description: "The average of your best 10 VF6s this session.",
			formatter: ToDecimalPlaces(3),
		},
		ProfileVF6: {
			description:
				"The average of your best 10 VF6s this session, multiplied to be on the same scale as profile VOLFORCE.",
			formatter: ToDecimalPlaces(3),
		},
	},
	profileRatingAlgs: {
		VF6: {
			description: "Your best 50 VF6 values added together.",
			formatter: ToDecimalPlaces(3),
		},
	},

	defaultScoreRatingAlg: "VF6",
	defaultSessionRatingAlg: "ProfileVF6",
	defaultProfileRatingAlg: "VF6",

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["NOV", "ADV", "EXH", "INF"],
		difficultyShorthand: {}, // they're all already short enough.
		defaultDifficulty: "EXH",
	},

	supportedClasses: {},

	orderedJudgements: ["critical", "near", "miss"],

	chartSets: [],

	supportedTierlists: {},

	supportedMatchTypes: ["uscChartHash", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;

export const USC_KEYBOARD_CONF = USC_CONTROLLER_CONF;
