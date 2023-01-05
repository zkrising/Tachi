import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ToDecimalPlaces } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, GamePTConfig } from "../../types/internals";

export const USC_CONF = {
	defaultPlaytype: "Controller",
	name: "USC",
	playtypes: ["Controller", "Keyboard"],
	songData: z.strictObject({}),
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

	optionalMetrics: {
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

	difficulties: {
		type: "FIXED",
		order: ["NOV", "ADV", "EXH", "INF"],
		shorthand: {}, // they're all already short enough.
		default: "EXH",
	},

	classes: {},

	orderedJudgements: ["critical", "near", "miss"],

	versions: [],

	chartData: z.strictObject({
		hashSHA1: z.union([z.array(z.string()), z.string()]),
		isOfficial: z.boolean(),
		effector: z.string(),
		tableFolders: z.array(
			z.strictObject({
				table: z.string(),
				level: z.string(),
			})
		),
	}),

	preferences: z.strictObject({ vf6Target: z.number() }),
	scoreMeta: z.strictObject({
		noteMod: z.enum(["MIR-RAN", "MIRROR", "NORMAL", "RANDOM"]).optional(),
		gaugeMod: z.enum(["NORMAL", "HARD", "PERMISSIVE"]).optional(),
	}),

	supportedMatchTypes: ["uscChartHash", "tachiSongID"],
} as const satisfies GamePTConfig;

export const USC_KEYBOARD_CONF = USC_CONTROLLER_CONF;
