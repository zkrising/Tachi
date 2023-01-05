import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, GamePTConfig } from "../../types/internals";

export const GITADORA_CONF = {
	defaultPlaytype: "Dora",
	name: "GITADORA",
	playtypes: ["Gita", "Dora"],
	songData: z.strictObject({
		isHot: z.boolean(),
		displayVersion: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

const GitadoraColours = [
	ClassValue("WHITE", "白", "White"),
	ClassValue("ORANGE", "橙", "Orange"),
	ClassValue("ORANGE_GRD", "橙グラ", "Orange Gradient"),
	ClassValue("YELLOW", "黄", "Yellow"),
	ClassValue("YELLOW_GRD", "黄グラ", "Yellow Gradient"),
	ClassValue("GREEN", "緑", "Green"),
	ClassValue("GREEN_GRD", "緑グラ", "Green Gradient"),
	ClassValue("BLUE", "青", "Blue"),
	ClassValue("BLUE_GRD", "青グラ", "Blue Gradient"),
	ClassValue("PURPLE", "紫", "Purple"),
	ClassValue("PURPLE_GRD", "紫グラ", "Purple Gradient"),
	ClassValue("RED", "赤", "Red"),
	ClassValue("RED_GRD", "赤グラ", "Red Gradient"),
	ClassValue("BRONZE", "銅", "Bronze"),
	ClassValue("SILVER", "銀", "Silver"),
	ClassValue("GOLD", "金", "Gold"),
	ClassValue("RAINBOW", "虹", "Rainbow"),
];

export const GITADORA_GITA_CONF = {
	providedMetrics: {
		percent: { type: "DECIMAL" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["C", "B", "A", "S", "SS", "MAX"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "percent",
	preferredDefaultEnum: "grade",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	scoreRatingAlgs: { skill: { description: "Skill Rating as it's implemented in game." } },
	sessionRatingAlgs: {
		skill: { description: "The average of your best 10 skill ratings this session." },
	},
	profileRatingAlgs: {
		skill: {
			description: "Your profile skill as it's implemented in game -- 25 HOT and 25 not HOT.",
		},
		naiveSkill: {
			description:
				"Your best 50 skill levels added together, regardless of whether the chart is HOT or not.",
		},
	},

	defaultScoreRatingAlg: "skill",
	defaultSessionRatingAlg: "skill",
	defaultProfileRatingAlg: "skill",

	difficulties: {
		type: "FIXED",
		order: [
			"BASIC",
			"ADVANCED",
			"EXTREME",
			"MASTER",
			"BASS BASIC",
			"BASS ADVANCED",
			"BASS EXTREME",
			"BASS MASTER",
		],
		shorthand: {
			BASIC: "G-BSC",
			ADVANCED: "G-ADV",
			EXTREME: "G-EXT",
			MASTER: "G-MAS",
			"BASS BASIC": "B-BSC",
			"BASS ADVANCED": "B-ADV",
			"BASS EXTREME": "B-EXT",
			"BASS MASTER": "B-MAS",
		},
		default: "EXTREME",
	},

	classes: {
		colour: { type: "DERIVED", values: GitadoraColours },
	},

	orderedJudgements: ["perfect", "great", "good", "ok", "miss"],

	versions: ["Konaste"],

	chartData: z.strictObject({
		inGameID: zodNonNegativeInt,
	}),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
} as const satisfies GamePTConfig;

export const GITADORA_DORA_CONF = {
	...GITADORA_GITA_CONF,

	difficulties: {
		type: "FIXED",
		order: ["BASIC", "ADVANCED", "EXTREME", "MASTER"],
		shorthand: {
			BASIC: "D-BSC",
			ADVANCED: "D-ADV",
			EXTREME: "D-EXT",
			MASTER: "D-MAS",
		},
		default: "EXTREME",
	},
} as const satisfies GamePTConfig;
