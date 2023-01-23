import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtNum, FmtPercent } from "../../utils/util";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const POPN_CONF = {
	defaultPlaytype: "9B",
	name: "pop'n music",
	playtypes: ["9B"],
	songData: z.strictObject({
		displayVersion: z.nullable(z.string()),
		genre: z.string(),
		genreEN: z.nullable(z.string()),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

const PopnClasses = [
	ClassValue("KITTY", "にゃんこ", "Kitty"),
	ClassValue("STUDENT", "小学生", "Grade School Student"),
	ClassValue("DELINQUENT", "番長", "Delinquent"),
	ClassValue("DETECTIVE", "刑事", "Detective"),
	ClassValue("IDOL", "アイドル", "Idol"),
	ClassValue("GENERAL", "将軍", "General"),
	ClassValue("HERMIT", "仙人", "Hermit"),
	ClassValue("GOD", "神", "God"),
];

export const POPN_9B_CONF = {
	providedMetrics: {
		score: {
			type: "INTEGER",
			validate: p.isBetween(0, 100_000),
			formatter: FmtNum,
			description: "The score value.",
		},
		clearMedal: {
			type: "ENUM",
			values: [
				"failedCircle",
				"failedDiamond",
				"failedStar",
				"easyClear",
				"clearCircle",
				"clearDiamond",
				"clearStar",
				"fullComboCircle",
				"fullComboDiamond",
				"fullComboStar",
				"perfect",
			],
			minimumRelevantValue: "clearCircle",
			description: "The clear medal for this score. This is a superset of lamps.",
		},
	},

	derivedMetrics: {
		/**
		 * Derived from the more specific "clearMedal". Since this is a smaller
		 * set than the clearMedal set, it's easier to swallow.
		 */
		lamp: {
			type: "ENUM",
			values: ["FAILED", "EASY CLEAR", "CLEAR", "FULL COMBO", "PERFECT"],
			minimumRelevantValue: "CLEAR",
			description:
				"The lamp for this score. This is a subset of clearMedals, and is - as a result - derived from them. We keep both around as lamps are better for grouping up scores.",
		},
		grade: {
			type: "ENUM",
			values: ["E", "D", "C", "B", "A", "AA", "AAA", "S"],
			minimumRelevantValue: "A",
			description:
				"The grade this score was worth. Note that scores are capped at a grade of A if they are a fail, regardless of how good the score was.",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "lamp",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		gauge: {
			type: "DECIMAL",
			validate: p.isBetween(0, 100),
			formatter: FmtPercent,
			description:
				"The gauge value this score had at the end. This is a value between 0 and 100.",
		},
	},

	scoreRatingAlgs: {
		classPoints: {
			description: "Class Points as they're implemented in game.",
		},
	},

	sessionRatingAlgs: {
		classPoints: {
			description: "The average of your best 10 class points this session.",
		},
	},

	profileRatingAlgs: {
		naiveClassPoints: {
			description:
				"A naive average of your best 20 scores. This is different to in game class points, as that is affected by recent scores, and not just your best scores.",
		},
	},

	defaultScoreRatingAlg: "classPoints",
	defaultSessionRatingAlg: "classPoints",
	defaultProfileRatingAlg: "naiveClassPoints",

	difficulties: {
		type: "FIXED",
		order: ["Easy", "Normal", "Hyper", "EX"],
		shorthand: {
			Easy: "E",
			Normal: "N",
			Hyper: "H",
			EX: "EX",
		},
		default: "EX",
	},

	classes: {
		class: {
			type: "DERIVED",
			values: PopnClasses,
		},
	},

	orderedJudgements: ["cool", "great", "good", "bad"],

	versions: {
		peace: "peace",
		kaimei: "Kaimei Riddles",
	},

	chartData: z.strictObject({
		// Array<string> | string | null
		hashSHA256: z.union([z.array(z.string()), z.string(), z.null()]),
		inGameID: zodNonNegativeInt,
	}),

	scoreMeta: z.strictObject({
		hiSpeed: z.number().optional(),
		hidden: z.number().optional(),
		sudden: z.number().optional(),
		random: z.enum(["MIRROR", "NONRAN", "RANDOM", "S-RANDOM"]).optional(),
		gauge: z.enum(["EASY", "NORMAL", "HARD", "DANGER"]).optional(),
	}),

	preferences: z.strictObject({}),

	supportedMatchTypes: ["inGameID", "tachiSongID", "popnChartHash"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;
