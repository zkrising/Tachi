import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtScoreNoCommas, FmtPercent } from "../../utils/util";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const PMS_CONF = {
	defaultPlaytype: "Controller",
	name: "PMS",
	playtypes: ["Controller", "Keyboard"],
	songData: z.strictObject({
		genre: z.nullable(z.string()),
		subtitle: z.nullable(z.string()),
		subartist: z.nullable(z.string()),
		tableString: z.nullable(z.string()),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

const PMSDans = [
	ClassValue("INSANE_1", "●1", "Insane 1st Dan"),
	ClassValue("INSANE_2", "●2", "Insane 2nd Dan"),
	ClassValue("INSANE_3", "●3", "Insane 3rd Dan"),
	ClassValue("INSANE_4", "●4", "Insane 4th Dan"),
	ClassValue("INSANE_5", "●5", "Insane 5th Dan"),
	ClassValue("INSANE_6", "●6", "Insane 6th Dan"),
	ClassValue("INSANE_7", "●7", "Insane 7th Dan"),
	ClassValue("INSANE_8", "●8", "Insane 8th Dan"),
	ClassValue("INSANE_9", "●9", "Insane 9th Dan"),
	ClassValue("INSANE_10", "●10", "Insane 10th Dan"),
	ClassValue("INSANE_KAIDEN", "●●", "Insane Kaiden"),
	ClassValue("OVERJOY", "●OJ", "Overjoy"),
	ClassValue("UNDEFINED", "●UNDF", "Undefined (Post-Overjoy)"),
];

function FormatSieglindePMS(sgl: number): string {
	if (sgl < 13) {
		return `○${sgl.toFixed(2)}`;
	}

	return `●${(sgl - 12).toFixed(2)}`;
}

export const PMS_CONTROLLER_CONF = {
	providedMetrics: {
		score: { type: "INTEGER", chartDependentMax: true, formatter: FmtScoreNoCommas },

		lamp: {
			type: "ENUM",
			values: [
				"NO PLAY",
				"FAILED",
				"ASSIST CLEAR",
				"EASY CLEAR",
				"CLEAR",
				"HARD CLEAR",
				"EX HARD CLEAR",
				"FULL COMBO",
			],
			minimumRelevantValue: "EASY CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
			minimumRelevantValue: "A",
		},

		// if #RANDOM is to ever be supported, the user's percent would become
		// a *mandatory* metric, as a chart's notecount can be completely unknown.
		// However, supporting #RANDOM is an awful pain, so I don't really care.
		percent: { type: "DECIMAL", validate: p.isBetween(0, 100), formatter: FmtPercent },
	},

	defaultMetric: "percent",
	preferredDefaultEnum: "lamp",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		bp: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		gauge: { type: "DECIMAL", validate: p.isBetween(0, 100), formatter: FmtPercent },
		gaugeHistory: { type: "GRAPH", validate: p.isBetween(0, 100) },
		epg: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		egr: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		egd: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		ebd: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		epr: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		lpg: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		lgr: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		lgd: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		lbd: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
		lpr: { type: "INTEGER", validate: p.isPositive, formatter: FmtScoreNoCommas },
	},

	scoreRatingAlgs: {
		sieglinde: {
			description:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
			formatter: FormatSieglindePMS,
		},
	},
	sessionRatingAlgs: {
		sieglinde: {
			description: "The average of your best 10 sieglinde ratings this session.",
			formatter: FormatSieglindePMS,
		},
	},
	profileRatingAlgs: {
		sieglinde: {
			description: "The average of your best 20 sieglinde ratings.",
			formatter: FormatSieglindePMS,
		},
	},

	defaultScoreRatingAlg: "sieglinde",
	defaultSessionRatingAlg: "sieglinde",
	defaultProfileRatingAlg: "sieglinde",

	// See `bms.ts` for an explanation of why this is like this.
	difficulties: {
		type: "FIXED",
		order: ["CHART"],
		shorthand: {},
		default: "CHART",
	},

	classes: {
		dan: { type: "PROVIDED", values: PMSDans },
	},

	orderedJudgements: ["cool", "great", "good", "bad", "poor"],

	versions: {},

	chartData: z.strictObject({
		notecount: zodNonNegativeInt,
		hashMD5: z.string(),
		hashSHA256: z.string(),
		tableFolders: z.array(z.strictObject({ table: z.string(), level: z.string() })),
		sglEC: z.number().nullable().optional(),
		sglHC: z.number().nullable().optional(),
	}),

	preferences: z.strictObject({}),
	scoreMeta: z.strictObject({
		random: z.enum(["MIRROR", "NONRAN", "R-RANDOM", "RANDOM", "S-RANDOM"]).optional(),
		client: z.enum(["beatoraja"]).optional(),
		gauge: z.enum(["EASY", "NORMAL", "HARD", "EX-HARD"]).optional(),
	}),

	supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;

export const PMS_KEYBOARD_CONF = PMS_CONTROLLER_CONF;
