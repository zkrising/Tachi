import { NoDecimalPlace } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const ITG_CONF = {
	defaultPlaytype: "Stamina",
	name: "ITG",
	validPlaytypes: ["Stamina"],
} as const satisfies INTERNAL_GAME_CONFIG;

export const ITG_STAMINA_CONF = {
	providedMetrics: {
		scorePercent: { type: "DECIMAL" },

		// How far through the chart did they get?
		// 100 means they cleared.
		// 50 means they got halfway through.
		// 0 means they died instantly etc.
		survivedPercent: { type: "DECIMAL" },

		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "FULL EXCELLENT COMBO", "QUAD", "QUINT"],
			minimumRelevantValue: "FAILED", // lol, maybe this is stupid.
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["D", "C", "B", "A", "S", "★", "★★", "★★★", "★★★★", "★★★★★"],
			minimumRelevantValue: "A",
		},

		// todo please come up with a better name

		// This metric is `survivedPercent` if the player didn't clear the chart
		// otherwise, it's their `scorePercent` + 100. This means that scores
		// are ordered like:
		//
		// #0  CLEARED with 90%        (190)
		// #1  CLEARED with 30%        (130)
		// #2  FAILED 95% in with 30%  (95)
		// #3  FAILED 40% in with 70%  (40)
		finalPercent: { type: "DECIMAL" },
	},

	additionalMetrics: {
		lifebarHistory: { type: "GRAPH" },
	},

	defaultMetric: "finalPercent",
	preferredDefaultEnum: "lamp",

	scoreRatingAlgs: {
		blockRating: {
			description: "How much this clear is worth.",
			formatter: NoDecimalPlace,
		},
		fastest32: {
			description: "The fastest BPM this score streamed 32 measures straight for.",
			formatter: NoDecimalPlace,
		},
	},

	sessionRatingAlgs: {
		blockRating: {
			description: "An average of your best 5 block levels cleared this session.",
			formatter: NoDecimalPlace,
		},
	},

	profileRatingAlgs: {
		highestBlock: {
			description: "The highest block level this player has cleared.",
			formatter: NoDecimalPlace,
		},
		fastest32: {
			description: "The fastest BPM this user has streamed 32 unbroken measures at.",
			formatter: NoDecimalPlace,
		},
	},

	defaultScoreRatingAlg: "blockRating",
	defaultSessionRatingAlg: "blockRating",
	defaultProfileRatingAlg: "highestBlock",

	difficultyConfig: {
		type: "DYNAMIC",
	},

	supportedClasses: {},

	orderedJudgements: ["15ms", "fantastic", "excellent", "great", "decent", "wayoff", "miss"],

	supportedVersions: [],

	supportedTierlists: {},

	supportedMatchTypes: ["itgChartHash", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
