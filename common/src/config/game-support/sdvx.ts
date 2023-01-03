import { ClassValue, ToDecimalPlaces, zodNonNegativeInt, zodTierlistData } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const SDVX_CONF = {
	defaultPlaytype: "Single",
	name: "SOUND VOLTEX",
	validPlaytypes: ["Single"],
	songData: {
		displayVersion: z.string(),
	},
} as const satisfies INTERNAL_GAME_CONFIG;

const SDVXDans = [
	ClassValue("DAN_1", "LV.01", "1st Dan"),
	ClassValue("DAN_2", "LV.02", "2nd Dan"),
	ClassValue("DAN_3", "LV.03", "3rd Dan"),
	ClassValue("DAN_4", "LV.04", "4th Dan"),
	ClassValue("DAN_5", "LV.05", "5th Dan"),
	ClassValue("DAN_6", "LV.06", "6th Dan"),
	ClassValue("DAN_7", "LV.07", "7th Dan"),
	ClassValue("DAN_8", "LV.08", "8th Dan"),
	ClassValue("DAN_9", "LV.09", "9th Dan"),
	ClassValue("DAN_10", "LV.10", "10th Dan"),
	ClassValue("DAN_11", "LV.11", "11th Dan"),
	ClassValue("INF", "LV.INF", "Inf. Dan"),
];

const SDVXVFClasses = [
	ClassValue("SIENNA_I", "Sienna I", "0 - 2.499VF"),
	ClassValue("SIENNA_II", "Sienna II", "2.5 - 4.999VF"),
	ClassValue("SIENNA_III", "Sienna III", "5.0 - 7.499VF"),
	ClassValue("SIENNA_IV", "Sienna IV", "7.5 - 9.999VF"),
	ClassValue("COBALT_I", "Cobalt I", "10 - 10.499VF"),
	ClassValue("COBALT_II", "Cobalt II", "10.5 - 10.999VF"),
	ClassValue("COBALT_III", "Cobalt III", "11 - 11.499VF"),
	ClassValue("COBALT_IV", "Cobalt IV", "11.5 - 11.999VF"),
	ClassValue("DANDELION_I", "Dandelion I", "12 - 12.499VF"),
	ClassValue("DANDELION_II", "Dandelion II", "12.5 - 12.999VF"),
	ClassValue("DANDELION_III", "Dandelion III", "13 - 13.499VF"),
	ClassValue("DANDELION_IV", "Dandelion IV", "13.5 - 13.999VF"),
	ClassValue("CYAN_I", "Cyan I", "14 - 14.249VF"),
	ClassValue("CYAN_II", "Cyan II", "14.25 - 14.499VF"),
	ClassValue("CYAN_III", "Cyan III", "14.5 - 14.749VF"),
	ClassValue("CYAN_IV", "Cyan IV", "14.75 - 14.999VF"),
	ClassValue("SCARLET_I", "Scarlet I", "15 - 15.249VF"),
	ClassValue("SCARLET_II", "Scarlet II", "15.25 - 15.499VF"),
	ClassValue("SCARLET_III", "Scarlet III", "15.5 - 15.749VF"),
	ClassValue("SCARLET_IV", "Scarlet IV", "15.75 - 15.999VF"),
	ClassValue("CORAL_I", "Coral I", "16 - 16.249VF"),
	ClassValue("CORAL_II", "Coral II", "16.25 - 16.499VF"),
	ClassValue("CORAL_III", "Coral III", "16.5 - 16.749VF"),
	ClassValue("CORAL_IV", "Coral IV", "16.75 - 16.999VF"),
	ClassValue("ARGENTO_I", "Argento I", "17 - 17.249VF"),
	ClassValue("ARGENTO_II", "Argento II", "17.25 - 17.499VF"),
	ClassValue("ARGENTO_III", "Argento III", "17.5 - 17.749VF"),
	ClassValue("ARGENTO_IV", "Argento IV", "17.75 - 17.999VF"),
	ClassValue("ELDORA_I", "Eldora I", "18 - 18.249VF"),
	ClassValue("ELDORA_II", "Eldora II", "18.25 - 18.499VF"),
	ClassValue("ELDORA_III", "Eldora III", "18.5 - 18.749VF"),
	ClassValue("ELDORA_IV", "Eldora IV", "18.75 - 18.999VF"),
	ClassValue("CRIMSON_I", "Crimson I", "19 - 19.249VF"),
	ClassValue("CRIMSON_II", "Crimson II", "19.25 - 19.499VF"),
	ClassValue("CRIMSON_III", "Crimson III", "19.5 - 19.749VF"),
	ClassValue("CRIMSON_IV", "Crimson IV", "19.75 - 19.999VF"),
	ClassValue("IMPERIAL_I", "Imperial I", "20 - 20.999VF"),
	ClassValue("IMPERIAL_II", "Imperial II", "21 - 21.999VF"),
	ClassValue("IMPERIAL_III", "Imperial III", "22 - 22.999VF"),
	ClassValue("IMPERIAL_IV", "Imperial IV", ">23VF"),
];

export const SDVX_SINGLE_CONF = {
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
		exScore: { type: "INTEGER" },
		gauge: { type: "DECIMAL" },
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
		difficultyOrder: ["NOV", "ADV", "EXH", "INF", "GRV", "HVN", "VVD", "XCD", "MXM"],
		difficultyShorthand: {}, // they're all already short enough
		defaultDifficulty: "EXH",
	},

	supportedClasses: {
		dan: {
			type: "PROVIDED",
			values: SDVXDans,
		},
		vfClass: {
			type: "DERIVED",
			values: SDVXVFClasses,
		},
	},

	orderedJudgements: ["critical", "near", "miss"],

	chartSets: [
		"BOOTH",
		"infinite infection",
		"GRAVITY WARS",
		"HEAVENLY HAVEN",
		"VIVID WAVE",
		"EXCEED GEAR",
		"Konaste",
	],

	chartData: {
		inGameID: zodNonNegativeInt,
		clearTier: zodTierlistData(),
	},

	supportedMatchTypes: ["sdvxInGameID", "songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
