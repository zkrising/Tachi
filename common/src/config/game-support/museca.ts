import { DEFAULT_ADDITIONAL_METRICS } from "./_common";
import { COLOUR_SET } from "../../constants/colour-set";
import { NoDecimalPlace } from "../internal-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const MUSECA_CONF = {
	defaultPlaytype: "Single",
	name: "MÚSECA",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;

export const MUSECA_GPT_CONF = {
	mandatoryMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			minimumRelevantValue: "CLEAR",
			values: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",

			// MUSECA uses kanji for its grades. This is kinda inconvenient to read.
			// Ah well!
			orderedGrades: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],

			// This is equal to 900K.
			// In my opinion (zkldi) this is a little too low for this
			// game, as 900K is pretty easy to get. Ah well!
			minimumRelevantValue: "優",
		},
	},

	additionalMetrics: {
		...DEFAULT_ADDITIONAL_METRICS,
	},

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

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["Green", "Yellow", "Red"],
		difficultyShorthand: { Green: "G", Yellow: "Y", Red: "R" },
		defaultDifficulty: "Red",
		difficultyColours: {
			Green: COLOUR_SET.green,
			Yellow: COLOUR_SET.vibrantYellow,
			Red: COLOUR_SET.red,
		},
	},

	orderedGrades: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],
	gradeColours: {
		没: COLOUR_SET.gray,
		拙: COLOUR_SET.maroon,
		凡: COLOUR_SET.red,
		佳: COLOUR_SET.paleGreen,
		良: COLOUR_SET.paleBlue,
		優: COLOUR_SET.green,
		秀: COLOUR_SET.blue,
		傑: COLOUR_SET.teal,
		傑G: COLOUR_SET.gold,
	},
	minimumRelevantGrade: "良",

	supportedClasses: {},

	orderedJudgements: ["critical", "near", "miss"],

	scoreBucket: "grade",

	supportedVersions: ["1 + 1/2", "1 + 1/2 Rev. B"],

	supportedTierlists: {},

	supportedMatchTypes: ["songTitle", "tachiSongID", "inGameID"],
} as const satisfies INTERNAL_GPT_CONFIG;
