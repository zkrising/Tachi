import { COLOUR_SET } from "../../constants/colour-set";
import { SDVXDans, SDVXVFClasses } from "../game-classes";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const SDVX_CONF = {
	defaultPlaytype: "Single",
	name: "SOUND VOLTEX",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;

export const SDVX_GPT_CONF = {
	scoreRatingAlgs: {
		VF6: {
			description: "VOLFORCE as it is implemented in SDVX6.",
			formatter: (v) => v.toFixed(3),
		},
	},
	sessionRatingAlgs: {
		VF6: {
			description: "The average of your best 10 VF6s this session.",
			formatter: (v) => v.toFixed(3),
		},
		ProfileVF6: {
			description:
				"The average of your best 10 VF6s this session, multiplied to be on the same scale as profile VOLFORCE.",
			formatter: (v) => v.toFixed(3),
		},
	},
	profileRatingAlgs: {
		VF6: {
			description: "Your best 50 VF6 values added together.",
			formatter: (v) => v.toFixed(3),
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
		difficultyColours: {
			NOV: COLOUR_SET.purple,
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: COLOUR_SET.vibrantPink,
			GRV: COLOUR_SET.orange,
			HVN: COLOUR_SET.teal,
			VVD: COLOUR_SET.pink,
			XCD: COLOUR_SET.blue,
			MXM: COLOUR_SET.white,
		},
	},

	orderedGrades: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S", "PUC"],
	gradeColours: {
		D: COLOUR_SET.gray,
		C: COLOUR_SET.red,
		B: COLOUR_SET.maroon,
		A: COLOUR_SET.paleBlue,
		"A+": COLOUR_SET.blue,
		AA: COLOUR_SET.paleGreen,
		"AA+": COLOUR_SET.green,
		AAA: COLOUR_SET.gold,
		"AAA+": COLOUR_SET.vibrantOrange,
		S: COLOUR_SET.teal,
		PUC: COLOUR_SET.pink,
	},
	minimumRelevantGrade: "A",

	orderedLamps: [
		"FAILED",
		"CLEAR",
		"EXCESSIVE CLEAR",
		"ULTIMATE CHAIN",
		"PERFECT ULTIMATE CHAIN",
	],
	lampColours: {
		FAILED: COLOUR_SET.red,
		CLEAR: COLOUR_SET.green,
		"EXCESSIVE CLEAR": COLOUR_SET.purple,
		"ULTIMATE CHAIN": COLOUR_SET.teal,
		"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
	},
	minimumRelevantLamp: "CLEAR",

	supportedClasses: {
		dan: { downgradable: false, canBeBatchManualSubmitted: true, values: SDVXDans },
		vfClass: { downgradable: true, canBeBatchManualSubmitted: false, values: SDVXVFClasses },
	},

	orderedJudgements: ["critical", "near", "miss"],

	scoreBucket: "grade",

	supportedVersions: ["booth", "inf", "gw", "heaven", "vivid", "exceed", "konaste"],

	supportedTierlists: {
		clear: {
			description: "Clearing values taken from the unofficial SDVX spreadsheet tierlists.",
		},
	},

	supportedMatchTypes: ["sdvxInGameID", "songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
