import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue, zodNonNegativeInt, zodTierlistData } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const IIDX_CONF = {
	defaultPlaytype: "SP",
	name: "beatmania IIDX",
	validPlaytypes: ["SP", "DP"],
	songData: {
		genre: z.string(),
		displayVersion: z.nullable(z.string()),
	},
} as const satisfies INTERNAL_GAME_CONFIG;

export const IIDXDans = [
	ClassValue("KYU_7", "七級", "7th Kyu"),
	ClassValue("KYU_6", "六級", "6th Kyu"),
	ClassValue("KYU_5", "五級", "5th Kyu"),
	ClassValue("KYU_4", "四級", "4th Kyu"),
	ClassValue("KYU_3", "三級", "3rd Kyu"),
	ClassValue("KYU_2", "二級", "2nd Kyu"),
	ClassValue("KYU_1", "一級", "1st Kyu"),
	ClassValue("DAN_1", "初段", "1st Dan"),
	ClassValue("DAN_2", "二段", "2nd Dan"),
	ClassValue("DAN_3", "三段", "3rd Dan"),
	ClassValue("DAN_4", "四段", "4th Dan"),
	ClassValue("DAN_5", "五段", "5th Dan"),
	ClassValue("DAN_6", "六段", "6th Dan"),
	ClassValue("DAN_7", "七段", "7th Dan"),
	ClassValue("DAN_8", "八段", "8th Dan"),
	ClassValue("DAN_9", "九段", "9th Dan"),
	ClassValue("DAN_10", "十段", "10th Dan"),
	ClassValue("CHUUDEN", "中伝", "Chuuden"),
	ClassValue("KAIDEN", "皆伝", "Kaiden"),
];

const BASE_IIDX_CHART_DATA = {
	notecount: zodNonNegativeInt,
	inGameID: z.union([z.array(z.number().int()), z.number().int()]),
	hashSHA256: z.string().nullable(),
	"2dxtraSet": z.string().nullable(),
	kaidenAverage: z.number().int().positive().nullable(),
	worldRecord: z.number().int().positive().nullable(),
	bpiCoefficient: z.number().positive().nullable(),
};

export const IIDX_SP_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
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
		percent: {
			type: "DECIMAL",
		},
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

		bp: { type: "INTEGER" },
		gauge: { type: "DECIMAL" },
		comboBreak: { type: "INTEGER" },

		// The players history for the gauge type they were playing on.
		gaugeHistory: { type: "GRAPH" },

		// if "GSM" is enabled (via fervidex.dll) then all graphs
		// are sent. we should store all of them.
		gsmEasy: { type: "GRAPH" },
		gsmNormal: { type: "GRAPH" },
		gsmHard: { type: "GRAPH" },
		gsmEXHard: { type: "GRAPH" },
	},

	defaultScoreRatingAlg: "ktLampRating",
	defaultSessionRatingAlg: "ktLampRating",
	defaultProfileRatingAlg: "ktLampRating",

	scoreRatingAlgs: {
		ktLampRating: {
			description:
				"A rating system that values your clear lamps on charts. Tierlist information is taken into account.",
		},
		BPI: {
			description:
				"A rating system for Kaiden level play. Only applies to 11s and 12s. A BPI of 0 states the score is equal to the Kaiden Average for that chart. A BPI of 100 is equal to the world record.",
		},
	},

	profileRatingAlgs: {
		ktLampRating: { description: `An average of your best 20 ktLampRatings.` },
		BPI: { description: `An average of your best 20 BPIs.` },
	},
	sessionRatingAlgs: {
		ktLampRating: { description: `An average of the best 10 ktLampRatings this session.` },
		BPI: { description: `An average of the best 10 BPIs this session.` },
	},

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: [
			"NORMAL",
			"HYPER",
			"ANOTHER",
			"LEGGENDARIA",
			"All Scratch NORMAL",
			"All Scratch HYPER",
			"All Scratch ANOTHER",
			"All Scratch LEGGENDARIA",
			"Kichiku NORMAL",
			"Kichiku HYPER",
			"Kichiku ANOTHER",
			"Kichiku LEGGENDARIA",
			"Kiraku NORMAL",
			"Kiraku HYPER",
			"Kiraku ANOTHER",
			"Kiraku LEGGENDARIA",
		],
		difficultyShorthand: {
			NORMAL: "N",
			HYPER: "H",
			ANOTHER: "A",
			LEGGENDARIA: "L",
			"All Scratch NORMAL": "N (Scr.)",
			"All Scratch HYPER": "H (Scr.)",
			"All Scratch ANOTHER": "A (Scr.)",
			"All Scratch LEGGENDARIA": "L (Scr.)",
			"Kichiku NORMAL": "N (Kc.)",
			"Kichiku HYPER": "H (Kc.)",
			"Kichiku ANOTHER": "A (Kc.)",
			"Kichiku LEGGENDARIA": "L (Kc.)",
			"Kiraku NORMAL": "N (Kr.)",
			"Kiraku HYPER": "H (Kr.)",
			"Kiraku ANOTHER": "A (Kr.)",
			"Kiraku LEGGENDARIA": "L (Kr.)",
		},
		defaultDifficulty: "ANOTHER",
	},

	supportedClasses: {
		dan: {
			type: "PROVIDED",
			values: IIDXDans,
		},
	},

	orderedJudgements: ["pgreat", "great", "good", "bad", "poor"],

	chartSets: [
		"3rd Style CS",
		"4th Style CS",
		"5th Style CS",
		"6th Style CS",
		"7th Style CS",
		"8th Style CS",
		"9th Style CS",
		"10th Style CS",
		"IIDX RED CS",
		"HAPPY SKY CS",
		"DISTORTED CS",
		"GOLD CS",
		"DJ TROOPERS CS",
		"EMPRESS CS",
		"tricoro",
		"SPADA",
		"PENDUAL",
		"copula",
		"SINOBUZ",
		"CANNON BALLERS",
		"ROOTAGE",
		"HEROIC VERSE",
		"BISTROVER",
		"CastHour",
		"Resident",
		"ROOTAGE Omnimix",
		"HEROIC VERSE Omnimix",
		"BISTROVER Omnimix",
		"CastHour Omnimix",
		"HEROIC VERSE 2dxtra",
		"BISTROVER 2dxtra",
		"BEATMANIA US",
		"INFINITAS",
	],

	chartData: {
		...BASE_IIDX_CHART_DATA,
		ncTier: zodTierlistData(),
		hcTier: zodTierlistData(),
		exhcTier: zodTierlistData(),
	},

	supportedMatchTypes: ["inGameID", "tachiSongID", "songTitle"],
} as const satisfies INTERNAL_GPT_CONFIG;

export const IIDX_DP_CONF = {
	...IIDX_SP_CONF,

	chartData: {
		...BASE_IIDX_CHART_DATA,

		dpTier: zodTierlistData(),
	},
} as const satisfies INTERNAL_GPT_CONFIG;
