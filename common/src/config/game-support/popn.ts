import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const POPN_CONF = {
	defaultPlaytype: "9B",
	name: "pop'n music",
	validPlaytypes: ["9B"],
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
		score: { type: "INTEGER" },
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
		},
		grade: {
			type: "ENUM",
			values: ["E", "D", "C", "B", "A", "AA", "AAA", "S"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "lamp",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		gauge: { type: "INTEGER" },
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

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["Easy", "Normal", "Hyper", "EX"],
		difficultyShorthand: {
			Easy: "E",
			Normal: "N",
			Hyper: "H",
			EX: "EX",
		},
		defaultDifficulty: "EX",
	},

	supportedClasses: {
		class: {
			type: "DERIVED",
			values: PopnClasses,
		},
	},

	orderedJudgements: ["cool", "great", "good", "bad"],

	chartSets: ["peace", "Kaimei Riddles"],

	supportedTierlists: {},

	supportedMatchTypes: ["inGameID", "tachiSongID", "popnChartHash"],
} as const satisfies INTERNAL_GPT_CONFIG;
