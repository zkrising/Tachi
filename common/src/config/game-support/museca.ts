import { FAST_SLOW_MAXCOMBO } from "./_common";
import { NoDecimalPlace, zodNonNegativeInt } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, GamePTConfig } from "../../types/internals";

export const MUSECA_CONF = {
	defaultPlaytype: "Single",
	name: "MÚSECA",
	playtypes: ["Single"],
	songData: z.strictObject({
		titleJP: z.string(),
		artistJP: z.string(),
		displayVersion: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

export const MUSECA_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",

			// MUSECA uses kanji for its grades. This is kinda inconvenient to read.
			// Ah well!
			values: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],

			// This is equal to 900K.
			// In my opinion (zkldi) this is a little too low for this
			// game, as 900K is pretty easy to get. Ah well!
			minimumRelevantValue: "優",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	additionalMetrics: FAST_SLOW_MAXCOMBO,

	scoreRatingAlgs: {
		curatorSkill: {
			description: "Curator Skill as it's implemented in-game.",
			formatter: NoDecimalPlace,
		},
	},
	sessionRatingAlgs: {
		curatorSkill: {
			description: "The average of your best 10 Curator skills this session.",
			formatter: NoDecimalPlace,
		},
	},
	profileRatingAlgs: {
		curatorSkill: {
			description:
				"The sum of your best 20 Curator Skills. This is identical to how it's calculated in-game.",
		},
	},

	defaultScoreRatingAlg: "curatorSkill",
	defaultSessionRatingAlg: "curatorSkill",
	defaultProfileRatingAlg: "curatorSkill",

	difficulties: {
		type: "FIXED",
		order: ["Green", "Yellow", "Red"],
		shorthand: { Green: "G", Yellow: "Y", Red: "R" },
		default: "Red",
	},

	classes: {},

	orderedJudgements: ["critical", "near", "miss"],

	versions: ["1 + 1/2", "1 + 1/2 Rev. B"],

	chartData: z.strictObject({ inGameID: zodNonNegativeInt }),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["songTitle", "tachiSongID", "inGameID"],
} as const satisfies GamePTConfig;
