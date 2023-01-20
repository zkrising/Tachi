import { FmtPercent } from "../../utils/util";
import { NoDecimalPlace, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const ITG_CONF = {
	defaultPlaytype: "Stamina",
	name: "ITG",
	playtypes: ["Stamina"],
	songData: z.strictObject({
		subtitle: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

export const ITG_STAMINA_CONF = {
	providedMetrics: {
		scorePercent: { type: "DECIMAL", validate: p.isBetween(0, 100), formatter: FmtPercent },

		// How far through the chart did they get?
		// 100 means they cleared.
		// 50 means they got halfway through.
		// 0 means they died instantly etc.
		survivedPercent: { type: "DECIMAL", validate: p.isBetween(0, 100), formatter: FmtPercent },

		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "FULL EXCELLENT COMBO", "QUAD", "QUINT"],
			minimumRelevantValue: "FAILED", // lol, maybe this is stupid.
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["F", "D", "C", "B", "A", "S", "★", "★★", "★★★", "★★★★"],
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
		//
		// NOTE that in our ITG implementation we don't allow for negative percents
		// as it breaks this silly metric. Also negative percents are stupid.
		finalPercent: {
			type: "DECIMAL",
			validate: p.isBetween(0, 200),
			formatter: (v) => {
				if (v < 100) {
					return `Died ${v.toFixed(2)}% in`;
				}

				return `Cleared with ${(v - 100).toFixed(2)}%`;
			},
		},
	},

	optionalMetrics: {
		lifebarHistory: { type: "GRAPH", validate: p.isBetween(0, 100) },
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

	difficulties: {
		type: "DYNAMIC",
	},

	classes: {},

	orderedJudgements: [
		"fantastic+",
		"fantastic",
		"excellent",
		"great",
		"decent",
		"wayoff",
		"miss",
	],

	versions: {},

	chartData: z.strictObject({
		// if this chart is "ranked" (i.e. worth any rating) what rating is it
		// ranked at?
		// For now, a chart is given this value if and only if it is in an ECS/SRPG.
		rankedLevel: z.number().nullable(),

		// what level does the chart say it is?
		chartLevel: z.number(),

		hashGSv3: z.string(),
		difficultyTag: z.enum(["Beginner", "Easy", "Medium", "Hard", "Expert", "Edit"] as const),

		// Chart length in seconds.
		length: z.number().positive(),
		charter: z.string(),

		// Pick one BPM to represent this chart's stream speed.
		// If that doesn't make any sense
		// (i.e. chart has significant bpm changes)
		// this should be null.
		// Note that for some charts with BPM changes, Archi typically picks a common
		// BPM to place it at. Not sure if that's automatable.
		streamBPM: z.number().nullable(),

		breakdown: z
			.strictObject({
				detailed: z.string(),
				partiallySimplified: z.string(),
				simplified: z.string(),
				total: z.string(),
				density: z.number(),
			})
			.nullable(),

		npsPerMeasure: z.array(zodNonNegativeInt),
		notesPerMeasure: z.array(zodNonNegativeInt),

		bannerLocationOverride: z.string().nullable(),
		originalPack: z.string(),
	}),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["itgChartHash", "tachiSongID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;
