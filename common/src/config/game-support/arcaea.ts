import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtNum } from "../../utils/util";
import { ClassValue, ToDecimalPlaces, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const ARCAEA_CONF = {
	name: "Arcaea",
	// Potential future controller playtype support?
	playtypes: ["Touch"],
	songData: z.strictObject({
		displayVersion: z.string(),
		songPack: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

// dans will be added as a later date as i figure out how the data is stored.

const ArcaeaBadges = [
	ClassValue("BLUE", "Blue", "0.00 - 3.49 Potential"),
	ClassValue("GREEN", "Green", "3.50 - 6.99 Potential"),
	ClassValue("ASH_PURPLE", "Ash Purple", "7.00 - 9.99 Potential"),
	ClassValue("PURPLE", "Purple", "10.00 - 10.99 Potential"),
	ClassValue("RED", "Red", "11.00 - 11.99 Potential"),
	ClassValue("ONE_STAR", "☆", "12.00 - 12.49 Potential"),
	ClassValue("TWO_STARS", "☆☆", "12.50 - 12.99 Potential"),
	ClassValue("THREE_STARS", "☆☆☆", ">=13.00 Potential"),
];

export const ARCAEA_TOUCH_CONF = {
	providedMetrics: {
		score: {
			type: "INTEGER",
			chartDependentMax: true,
			formatter: FmtNum,
			description:
				"The score value. This is between 0 and 10 million, plus bonus points dependent on how many shiny PUREs you get.",
		},
		lamp: {
			type: "ENUM",
			values: ["LOST", "EASY CLEAR", "CLEAR", "HARD CLEAR", "FULL RECALL", "PURE MEMORY"],
			minimumRelevantValue: "EASY CLEAR",
			description: "The type of clear this was.",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["D", "C", "B", "A", "AA", "EX", "EX+"],
			minimumRelevantValue: "AA",
			description: "The grade this score was.",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		gauge: {
			type: "INTEGER",
			validate: p.isBetween(0, 100),
			formatter: FmtNum,
			description: "The amount of life in the gauge at the end of this chart.",
		},
	},

	scoreRatingAlgs: {
		potential: {
			description: "Potential as it is implemented in Arcaea.",
			formatter: ToDecimalPlaces(2),
		},
	},
	sessionRatingAlgs: {
		naivePotential: {
			description: "The average of your best 10 potentials this session.",
			formatter: ToDecimalPlaces(2),
		},
	},
	profileRatingAlgs: {
		naivePotential: {
			description:
				"The average of your best 30 potential values. This is different to in-game, as it does not take into account your recent scores in any way.",
			formatter: ToDecimalPlaces(2),
		},
	},

	defaultScoreRatingAlg: "potential",
	defaultSessionRatingAlg: "naivePotential",
	defaultProfileRatingAlg: "naivePotential",

	difficulties: {
		type: "FIXED",
		order: ["Past", "Present", "Future", "Beyond"],
		shorthand: {
			Past: "PST",
			Present: "PRS",
			Future: "FTR",
			Beyond: "BYD",
		},
		default: "Future",
	},

	classes: {
		badge: {
			type: "DERIVED",
			values: ArcaeaBadges,
		},
	},

	orderedJudgements: ["pure", "far", "lost"],

	versions: {
		mobile: "Mobile",
		switch: "Nintendo Switch",
	},

	chartData: z.strictObject({
		inGameID: z.string(),
		notecount: zodNonNegativeInt,
	}),

	preferences: z.strictObject({}),
	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;
