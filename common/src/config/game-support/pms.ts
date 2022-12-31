import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const PMS_CONF = {
	defaultPlaytype: "Controller",
	name: "PMS",
	validPlaytypes: ["Controller", "Keyboard"],
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
		score: { type: "INTEGER" },

		// if #RANDOM is to ever be supported, the user's percent would become
		// a *mandatory* metric, as a chart's notecount can be completely unknown.
		// #RANDOM is not supported (other painful reasons), but this should be done
		// anyway.
		percent: { type: "DECIMAL" },

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
	},

	defaultMetric: "percent",
	preferredDefaultEnum: "lamp",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		// TODO
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
	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["CHART"],
		difficultyShorthand: {},
		defaultDifficulty: "CHART",
	},

	supportedClasses: {
		dan: { type: "PROVIDED", values: PMSDans },
	},

	orderedJudgements: ["cool", "great", "good", "bad", "poor"],

	supportedVersions: [],

	supportedTierlists: {
		"sgl-EC": { description: "Sieglinde Easy Clear ratings." },
		"sgl-HC": { description: "Sieglinde Hard Clear ratings." },
	},

	supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;

export const PMS_KEYBOARD_CONF = PMS_CONTROLLER_CONF;
