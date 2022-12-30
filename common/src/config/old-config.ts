/* eslint-disable lines-around-comment */
import { FormatSieglindeBMS, FormatSieglindePMS, FormatMaimaiDXRating } from "./internal-utils";
import { COLOUR_SET } from "../constants/colour-set";
import type { GPTTierlists } from "..";
import type { ClassInfo } from "./game-classes";

export interface GameConfig<P extends string> {
	internalName: string;
	name: string;
	defaultPlaytype: P;
	validPlaytypes: Array<P>;
}

interface BaseGamePTConfig<I extends IDStrings> {
	idString: I;

	percentMax: number;

	defaultScoreRatingAlg: ScoreCalculatedDataLookup[I];
	defaultSessionRatingAlg: SessionCalculatedDataLookup[I];
	defaultProfileRatingAlg: ProfileRatingLookup[I];

	scoreRatingAlgs: Array<ScoreCalculatedDataLookup[I]>;
	sessionRatingAlgs: Array<SessionCalculatedDataLookup[I]>;
	profileRatingAlgs: Array<ProfileRatingLookup[I]>;

	scoreRatingAlgDescriptions: Record<ScoreCalculatedDataLookup[I], string>;
	sessionRatingAlgDescriptions: Record<SessionCalculatedDataLookup[I], string>;
	profileRatingAlgDescriptions: Record<ProfileRatingLookup[I], string>;

	scoreRatingAlgFormatters: Partial<Record<ScoreCalculatedDataLookup[I], (v: number) => string>>;
	sessionRatingAlgFormatters: Partial<
		Record<SessionCalculatedDataLookup[I], (v: number) => string>
	>;
	profileRatingAlgFormatters: Partial<Record<ProfileRatingLookup[I], (v: number) => string>>;

	difficulties: Array<Difficulties[I]>;
	shortDifficulties: Partial<Record<Difficulties[I], string>>;
	defaultDifficulty: Difficulties[I];
	difficultyColours: Record<Difficulties[I], string | null>;

	orderedGrades: Array<Grades[I]>;
	gradeColours: Record<Grades[I], string>;
	minimumRelevantGrade: Grades[I];
	gradeBoundaries: Array<number>;

	orderedLamps: Array<Lamps[I]>;
	lampColours: Record<Lamps[I], string>;
	minimumRelevantLamp: Lamps[I];

	classHumanisedFormat: Record<GameClassSets[I], Array<ClassInfo>>;
	classProperties: Record<
		GameClassSets[I],
		{
			/**
			 * If a worse thing comes in for this, should this metric go down?
			 * I.e. if a user is 4th dan and they submit 3rd dan, should it go
			 * down to 3rd dan? (Hopefully not). This makes the most sense for
			 * metrics like "colour" in games, which are a function of some profile
			 * skill. If said profile skill goes down, it should reflect in that
			 * colour.
			 */
			downgradable: boolean;

			/**
			 * Can this class be sent in `batchManual.classes`? This only makes sense
			 * for classes that aren't a function of existing state, so things like
			 * submitting dan rank makes sense, but submitting things like "Colour"
			 * makes no sense (as it's a function of profile skill).
			 */
			canBeBatchManualSubmitted: boolean;
		}
	>;

	judgements: Array<JudgementLookup[I]>;

	scoreBucket: "grade" | "lamp";

	orderedSupportedVersions: Array<GPTSupportedVersions[I]>;

	tierlists: Array<GPTTierlists[I]>;
	tierlistDescriptions: Record<GPTTierlists[I], string>;

	/**
	 * What "matchTypes" should this game support for batch-manual imports? This
	 * allows us to disable things like "songTitle" resolutions for games like BMS,
	 * where song titles are absolutely not guaranteed to be unique.
	 */
	supportedMatchTypes: Array<MatchTypes>;
}

const GAME_PT_CONFIGS = {
	"iidx:SP": {
		defaultScoreRatingAlg: "ktLampRating",
		defaultSessionRatingAlg: "ktLampRating",
		defaultProfileRatingAlg: "ktLampRating",

		scoreRatingAlgs: ["ktLampRating", "BPI"],
		sessionRatingAlgs: ["ktLampRating", "BPI"],
		profileRatingAlgs: ["ktLampRating", "BPI"],

		scoreRatingAlgDescriptions: {
			ktLampRating: `A rating system that values your clear lamps on charts. Tierlist information is taken into account.`,
			BPI: `A rating system for Kaiden level play. Only applies to 11s and 12s. A BPI of 0 states the score is equal to the Kaiden Average for that chart. A BPI of 100 is equal to the world record.`,
		},
		profileRatingAlgDescriptions: {
			ktLampRating: `An average of your best 20 ktLampRatings.`,
			BPI: `An average of your best 20 BPIs.`,
		},
		sessionRatingAlgDescriptions: {
			ktLampRating: `An average of the best 10 ktLampRatings this session.`,
			BPI: `An average of the best 10 BPIs this session.`,
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: [
			"BEGINNER",
			"NORMAL",
			"HYPER",
			"ANOTHER",
			"LEGGENDARIA",
			"All Scratch BEGINNER",
			"All Scratch NORMAL",
			"All Scratch HYPER",
			"All Scratch ANOTHER",
			"All Scratch LEGGENDARIA",
			"Kichiku BEGINNER",
			"Kichiku NORMAL",
			"Kichiku HYPER",
			"Kichiku ANOTHER",
			"Kichiku LEGGENDARIA",
			"Kiraku BEGINNER",
			"Kiraku NORMAL",
			"Kiraku HYPER",
			"Kiraku ANOTHER",
			"Kiraku LEGGENDARIA",
		],
		difficultyShorthand: {
			BEGINNER: "B",
			NORMAL: "N",
			HYPER: "H",
			ANOTHER: "A",
			LEGGENDARIA: "L",
			"All Scratch BEGINNER": "B (Scr.)",
			"All Scratch NORMAL": "N (Scr.)",
			"All Scratch HYPER": "H (Scr.)",
			"All Scratch ANOTHER": "A (Scr.)",
			"All Scratch LEGGENDARIA": "L (Scr.)",
			"Kichiku BEGINNER": "B (Kc.)",
			"Kichiku NORMAL": "N (Kc.)",
			"Kichiku HYPER": "H (Kc.)",
			"Kichiku ANOTHER": "A (Kc.)",
			"Kichiku LEGGENDARIA": "L (Kc.)",
			"Kiraku BEGINNER": "B (Kr.)",
			"Kiraku NORMAL": "N (Kr.)",
			"Kiraku HYPER": "H (Kr.)",
			"Kiraku ANOTHER": "A (Kr.)",
			"Kiraku LEGGENDARIA": "L (Kr.)",
		},
		defaultDifficulty: "ANOTHER",
		difficultyColours: {
			BEGINNER: COLOUR_SET.paleGreen,
			NORMAL: COLOUR_SET.blue,
			HYPER: COLOUR_SET.orange,
			ANOTHER: COLOUR_SET.red,
			LEGGENDARIA: COLOUR_SET.purple,
			"All Scratch BEGINNER": COLOUR_SET.paleGreen,
			"All Scratch NORMAL": COLOUR_SET.blue,
			"All Scratch HYPER": COLOUR_SET.orange,
			"All Scratch ANOTHER": COLOUR_SET.red,
			"All Scratch LEGGENDARIA": COLOUR_SET.purple,
			"Kichiku BEGINNER": COLOUR_SET.paleGreen,
			"Kichiku NORMAL": COLOUR_SET.blue,
			"Kichiku HYPER": COLOUR_SET.orange,
			"Kichiku ANOTHER": COLOUR_SET.red,
			"Kichiku LEGGENDARIA": COLOUR_SET.purple,
			"Kiraku BEGINNER": COLOUR_SET.paleGreen,
			"Kiraku NORMAL": COLOUR_SET.blue,
			"Kiraku HYPER": COLOUR_SET.orange,
			"Kiraku ANOTHER": COLOUR_SET.red,
			"Kiraku LEGGENDARIA": COLOUR_SET.purple,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		supportedClasses: {
			dan: {
				downgradable: false,
				canBeBatchManualSubmitted: true,
				values: IIDXDans,
			},
		},

		judgements: ["pgreat", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [
			"3-cs",
			"4-cs",
			"5-cs",
			"6-cs",
			"7-cs",
			"8-cs",
			"9-cs",
			"10-cs",
			"11-cs",
			"12-cs",
			"13-cs",
			"14-cs",
			"15-cs",
			"16-cs",
			"20",
			"21",
			"22",
			"23",
			"24",
			"25",
			"26",
			"27",
			"28",
			"29",
			"30",
			"26-omni",
			"27-omni",
			"28-omni",
			"29-omni",
			"27-2dxtra",
			"28-2dxtra",
			"bmus",
			"inf",
		],

		supportedTierlists: {
			"kt-NC": {
				description:
					"The Normal Clear tiers for Kamaitachi. These are adapted from multiple sources.",
			},
			"kt-HC": {
				description:
					"The Hard Clear tiers for Kamaitachi. These are adapted from multiple sources.",
			},
			"kt-EXHC": {
				description:
					"The EX-HARD Clear tiers for Kamaitachi. These are adapted from multiple sources.",
			},
		},

		supportedMatchTypes: ["inGameID", "tachiSongID", "songTitle"],
	},
	"iidx:DP": {
		defaultScoreRatingAlg: "ktLampRating",
		defaultSessionRatingAlg: "ktLampRating",
		defaultProfileRatingAlg: "ktLampRating",

		scoreRatingAlgs: ["ktLampRating", "BPI"],
		sessionRatingAlgs: ["ktLampRating", "BPI"],
		profileRatingAlgs: ["ktLampRating", "BPI"],

		scoreRatingAlgDescriptions: {
			ktLampRating: `A rating system that values your clear lamps on charts. Tierlist information is taken into account.`,
			BPI: `A rating system for Kaiden level play. Only applies to 11s and 12s. A BPI of 0 states the score is equal to the Kaiden Average for that chart. A BPI of 100 is equal to the world record.`,
		},
		profileRatingAlgDescriptions: {
			ktLampRating: `An average of your best 20 ktLampRatings.`,
			BPI: `An average of your best 20 BPIs.`,
		},
		sessionRatingAlgDescriptions: {
			ktLampRating: `An average of the best 10 ktLampRatings this session.`,
			BPI: `An average of the best 10 BPIs this session.`,
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

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
		difficultyColours: {
			NORMAL: COLOUR_SET.blue,
			HYPER: COLOUR_SET.orange,
			ANOTHER: COLOUR_SET.red,
			LEGGENDARIA: COLOUR_SET.purple,
			"All Scratch NORMAL": COLOUR_SET.blue,
			"All Scratch HYPER": COLOUR_SET.orange,
			"All Scratch ANOTHER": COLOUR_SET.red,
			"All Scratch LEGGENDARIA": COLOUR_SET.purple,
			"Kichiku NORMAL": COLOUR_SET.blue,
			"Kichiku HYPER": COLOUR_SET.orange,
			"Kichiku ANOTHER": COLOUR_SET.red,
			"Kichiku LEGGENDARIA": COLOUR_SET.purple,
			"Kiraku NORMAL": COLOUR_SET.blue,
			"Kiraku HYPER": COLOUR_SET.orange,
			"Kiraku ANOTHER": COLOUR_SET.red,
			"Kiraku LEGGENDARIA": COLOUR_SET.purple,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		// see iidx:SP for an explaination of why this is wrote like this.
		gradeBoundaries: [
			0,
			(100 * 2) / 9,
			(100 * 3) / 9,
			(100 * 4) / 9,
			(100 * 5) / 9,
			(100 * 6) / 9,
			(100 * 7) / 9,
			(100 * 8) / 9,
			(100 * 17) / 18,
			(100 * 9) / 9,
		],

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			dan: IIDXDans,
		},
		classProperties: {
			dan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: true,
		judgementWindows: [
			{ name: "PGREAT", msBorder: 16.667, value: 2 },
			{ name: "GREAT", msBorder: 33.333, value: 1 },
			{ name: "GOOD", msBorder: 116.667, value: 0 },
		],
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [
			"3-cs",
			"4-cs",
			"5-cs",
			"6-cs",
			"7-cs",
			"8-cs",
			"9-cs",
			"10-cs",
			"11-cs",
			"12-cs",
			"13-cs",
			"14-cs",
			"15-cs",
			"16-cs",
			"20",
			"21",
			"22",
			"23",
			"24",
			"25",
			"26",
			"27",
			"28",
			"29",
			"30",
			"26-omni",
			"27-omni",
			"28-omni",
			"29-omni",
			"27-2dxtra",
			"28-2dxtra",
			"bmus",
			"inf",
		],

		tierlists: ["dp-tier"],
		tierlistDescriptions: {
			"dp-tier": "The unofficial DP tiers, taken from https://zasa.sakura.ne.jp/dp/run.php.",
		},
		supportedMatchTypes: ["inGameID", "tachiSongID", "songTitle"],
	},
	"chunithm:Single": {
		idString: "chunithm:Single",
		percentMax: 101,

		defaultScoreRatingAlg: "rating",
		defaultSessionRatingAlg: "naiveRating",
		defaultProfileRatingAlg: "naiveRating",

		scoreRatingAlgs: ["rating"],
		sessionRatingAlgs: ["naiveRating"],
		profileRatingAlgs: ["naiveRating"],

		scoreRatingAlgDescriptions: {
			rating: "The rating value of this score. This is identical to the system used in game.",
		},
		profileRatingAlgDescriptions: {
			naiveRating:
				"The average of your best 20 ratings. This is different to in-game, as it does not take into account your recent scores in any way.",
		},
		sessionRatingAlgDescriptions: {
			naiveRating: "The average of your best 10 ratings this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: ["BASIC", "ADVANCED", "EXPERT", "MASTER"],
		difficultyShorthand: {
			BASIC: "B",
			ADVANCED: "A",
			EXPERT: "E",
			MASTER: "M",
		},
		defaultDifficulty: "MASTER",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXPERT: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
		},

		orderedGrades: ["D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS"],
		gradeColours: {
			D: COLOUR_SET.red,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			BB: COLOUR_SET.blue,
			BBB: COLOUR_SET.vibrantBlue,
			A: COLOUR_SET.paleGreen,
			AA: COLOUR_SET.green,
			AAA: COLOUR_SET.vibrantGreen,
			S: COLOUR_SET.vibrantOrange,
			SS: COLOUR_SET.vibrantYellow,
			SSS: COLOUR_SET.teal,
		},
		minimumRelevantGrade: "A",
		gradeBoundaries: [0, 50, 60, 70, 80, 90, 92.5, 95.0, 97.5, 100, 100.75],

		orderedLamps: ["FAILED", "CLEAR", "FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.paleGreen,
			"FULL COMBO": COLOUR_SET.paleBlue,
			"ALL JUSTICE": COLOUR_SET.gold,
			"ALL JUSTICE CRITICAL": COLOUR_SET.white,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			colour: CHUNITHMColours,
		},
		classProperties: {
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["jcrit", "justice", "attack", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["paradiselost"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
	},
	"sdvx:Single": {
		idString: "sdvx:Single",
		percentMax: 100,

		defaultScoreRatingAlg: "VF6",
		defaultSessionRatingAlg: "ProfileVF6",
		defaultProfileRatingAlg: "VF6",

		scoreRatingAlgs: ["VF6"],
		sessionRatingAlgs: ["ProfileVF6", "VF6"],
		profileRatingAlgs: ["VF6"],

		scoreRatingAlgDescriptions: {
			VF6: "VOLFORCE as it is implemented in SDVX6.",
		},
		profileRatingAlgDescriptions: {
			VF6: "Your best 50 VF6 values added together.",
		},
		sessionRatingAlgDescriptions: {
			VF6: "The average of your best 10 VF6s this session.",
			ProfileVF6:
				"The average of your best 10 VF6s this session, multiplied to be on the same scale as profile VOLFORCE.",
		},

		scoreRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		profileRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		sessionRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
			ProfileVF6: (v) => v.toFixed(3),
		},

		difficultyOrder: ["NOV", "ADV", "EXH", "INF", "GRV", "HVN", "VVD", "XCD", "MXM"],
		difficultyShorthand: {}, // they're all fine
		defaultDifficulty: "EXH",
		difficultyColours: {
			NOV: COLOUR_SET.purple, // colour set dark purple
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: COLOUR_SET.vibrantPink,
			GRV: COLOUR_SET.orange,
			HVN: COLOUR_SET.teal,
			VVD: COLOUR_SET.pink,
			XCD: COLOUR_SET.blue,
			MXM: COLOUR_SET.white,
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
		gradeBoundaries: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99, 100],

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

		classHumanisedFormat: {
			dan: SDVXDans,
			vfClass: SDVXVFClasses,
		},
		classProperties: {
			dan: { downgradable: false, canBeBatchManualSubmitted: true },
			vfClass: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["critical", "near", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["booth", "inf", "gw", "heaven", "vivid", "exceed", "konaste"],

		tierlists: ["clear"],
		tierlistDescriptions: {
			clear: "Clearing values taken from the unofficial SDVX spreadsheet tierlists.",
		},

		supportedMatchTypes: ["sdvxInGameID", "songTitle", "tachiSongID"],
	},
	"usc:Controller": {
		idString: "usc:Controller",
		percentMax: 100,

		defaultScoreRatingAlg: "VF6",
		defaultSessionRatingAlg: "ProfileVF6",
		defaultProfileRatingAlg: "VF6",

		scoreRatingAlgs: ["VF6"],
		sessionRatingAlgs: ["ProfileVF6", "VF6"],
		profileRatingAlgs: ["VF6"],

		scoreRatingAlgDescriptions: {
			VF6: "VOLFORCE as it is implemented in SDVX6.",
		},
		profileRatingAlgDescriptions: {
			VF6: "Your best 50 VF6 values added together.",
		},
		sessionRatingAlgDescriptions: {
			VF6: "The average of your best 10 VF6s this session.",
			ProfileVF6:
				"The average of your best 10 VF6s this session, multiplied to be on the same scale as profile VOLFORCE.",
		},

		scoreRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		profileRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		sessionRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
			ProfileVF6: (v) => v.toFixed(3),
		},

		difficultyOrder: ["NOV", "ADV", "EXH", "INF"],
		difficultyShorthand: {}, // all fine
		defaultDifficulty: "EXH",
		difficultyColours: {
			NOV: COLOUR_SET.purple, // colour set dark purple
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: COLOUR_SET.vibrantPink,
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
		gradeBoundaries: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99, 100],

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
			"EXCESSIVE CLEAR": COLOUR_SET.orange,
			"ULTIMATE CHAIN": COLOUR_SET.teal,
			"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {},
		classProperties: {},

		supportsESD: false,
		judgements: ["critical", "near", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: [],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["uscChartHash", "tachiSongID"],
	},
	"usc:Keyboard": {
		idString: "usc:Keyboard",
		percentMax: 100,

		defaultScoreRatingAlg: "VF6",
		defaultSessionRatingAlg: "ProfileVF6",
		defaultProfileRatingAlg: "VF6",

		scoreRatingAlgs: ["VF6"],
		sessionRatingAlgs: ["ProfileVF6", "VF6"],
		profileRatingAlgs: ["VF6"],

		scoreRatingAlgDescriptions: {
			VF6: "VOLFORCE as it is implemented in SDVX6.",
		},
		profileRatingAlgDescriptions: {
			VF6: "Your best 50 VF6 values added together.",
		},
		sessionRatingAlgDescriptions: {
			VF6: "The average of your best 10 VF6s this session.",
			ProfileVF6:
				"The average of your best 10 VF6s this session, multiplied to be on the same scale as profile VOLFORCE.",
		},

		scoreRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		profileRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
		},
		sessionRatingAlgFormatters: {
			VF6: (v) => v.toFixed(3),
			ProfileVF6: (v) => v.toFixed(3),
		},

		difficultyOrder: ["NOV", "ADV", "EXH", "INF"],
		difficultyShorthand: {}, // all fine
		defaultDifficulty: "EXH",
		difficultyColours: {
			NOV: COLOUR_SET.purple, // colour set dark purple
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: COLOUR_SET.vibrantPink,
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
		gradeBoundaries: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99, 100],

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
			"EXCESSIVE CLEAR": COLOUR_SET.orange,
			"ULTIMATE CHAIN": COLOUR_SET.teal,
			"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {},
		classProperties: {},

		supportsESD: false,
		judgements: ["critical", "near", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: [],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["uscChartHash", "tachiSongID"],
	},
	"museca:Single": {
		idString: "museca:Single",
		percentMax: 100,

		defaultScoreRatingAlg: "curatorSkill",
		defaultSessionRatingAlg: "curatorSkill",
		defaultProfileRatingAlg: "curatorSkill",

		scoreRatingAlgs: ["curatorSkill"],
		sessionRatingAlgs: ["curatorSkill"],
		profileRatingAlgs: ["curatorSkill"],

		scoreRatingAlgDescriptions: {
			curatorSkill: "A custom rating system that combines score and the chart level.",
		},
		profileRatingAlgDescriptions: {
			curatorSkill: "The sum of your best 20 Curator Skills.",
		},
		sessionRatingAlgDescriptions: {
			curatorSkill: "The average of your best 10 curator skills this session.",
		},

		scoreRatingAlgFormatters: {
			curatorSkill: (v) => v.toFixed(0),
		},
		profileRatingAlgFormatters: {
			curatorSkill: (v) => v.toFixed(0),
		},
		sessionRatingAlgFormatters: {
			curatorSkill: (v) => v.toFixed(0),
		},

		difficultyOrder: ["Green", "Yellow", "Red"],
		difficultyShorthand: { Green: "G", Yellow: "Y", Red: "R" },
		defaultDifficulty: "Red",
		difficultyColours: {
			Green: COLOUR_SET.green,
			Yellow: COLOUR_SET.vibrantYellow,
			Red: COLOUR_SET.red,
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
		gradeBoundaries: [0, 60, 70, 80, 85, 90, 95, 97.5, 100],

		orderedLamps: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"CONNECT ALL": COLOUR_SET.teal,
			"PERFECT CONNECT ALL": COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {},
		classProperties: {},

		supportsESD: true,
		judgementWindows: [
			{ name: "CRITICAL", msBorder: 33.333, value: 2 },
			{ name: "NEAR", msBorder: 66.667, value: 1 },
		],
		judgements: ["critical", "near", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["1.5", "1.5-b"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["songTitle", "tachiSongID", "inGameID"],
	},
	"bms:7K": {
		idString: "bms:7K",
		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		scoreRatingAlgs: ["sieglinde"],
		sessionRatingAlgs: ["sieglinde"],
		profileRatingAlgs: ["sieglinde"],

		scoreRatingAlgDescriptions: {
			sieglinde:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
		},
		profileRatingAlgDescriptions: {
			sieglinde: "The average of your best 20 sieglinde ratings.",
		},
		sessionRatingAlgDescriptions: {
			sieglinde: "The average of your best 10 sieglinde ratings this session.",
		},

		scoreRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},
		profileRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},
		sessionRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},

		difficultyOrder: ["CHART"],
		difficultyShorthand: {}, // not real
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		// see iidx:SP for an explaination of why this is wrote like this.
		gradeBoundaries: [
			0,
			(100 * 2) / 9,
			(100 * 3) / 9,
			(100 * 4) / 9,
			(100 * 5) / 9,
			(100 * 6) / 9,
			(100 * 7) / 9,
			(100 * 8) / 9,
			(100 * 17) / 18,
			(100 * 9) / 9,
		],

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			genocideDan: BMSGenocideDans,
			stslDan: BMSStSlDans,
			lnDan: BMSLNDans,
			scratchDan: BMSScratchDans,
		},
		classProperties: {
			genocideDan: { downgradable: false, canBeBatchManualSubmitted: true },
			stslDan: { downgradable: false, canBeBatchManualSubmitted: true },
			lnDan: { downgradable: false, canBeBatchManualSubmitted: true },
			scratchDan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: false,
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [],

		tierlists: ["sgl-EC", "sgl-HC"],
		tierlistDescriptions: {
			"sgl-EC": "Sieglinde Easy Clear ratings.",
			"sgl-HC": "Sieglinde Hard Clear ratings.",
		},

		supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
	},
	"bms:14K": {
		idString: "bms:14K",

		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		scoreRatingAlgs: ["sieglinde"],
		sessionRatingAlgs: ["sieglinde"],
		profileRatingAlgs: ["sieglinde"],

		scoreRatingAlgDescriptions: {
			sieglinde:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
		},
		profileRatingAlgDescriptions: {
			sieglinde: "The average of your best 20 sieglinde ratings.",
		},
		sessionRatingAlgDescriptions: {
			sieglinde: "The average of your best 10 sieglinde ratings this session.",
		},

		scoreRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},
		profileRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},
		sessionRatingAlgFormatters: {
			sieglinde: FormatSieglindeBMS,
		},

		difficultyOrder: ["CHART"],
		difficultyShorthand: {}, // not real
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		// see iidx:SP for an explaination of why this is wrote like this.
		gradeBoundaries: [
			0,
			(100 * 2) / 9,
			(100 * 3) / 9,
			(100 * 4) / 9,
			(100 * 5) / 9,
			(100 * 6) / 9,
			(100 * 7) / 9,
			(100 * 8) / 9,
			(100 * 17) / 18,
			(100 * 9) / 9,
		],

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			genocideDan: BMSGenocideDans,
			stslDan: BMSDPSlDans,
		},
		classProperties: {
			genocideDan: { downgradable: false, canBeBatchManualSubmitted: true },
			stslDan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: false,
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [],

		tierlists: ["sgl-EC", "sgl-HC"],
		tierlistDescriptions: {
			"sgl-EC": "Sieglinde Easy Clear ratings.",
			"sgl-HC": "Sieglinde Hard Clear ratings.",
		},

		supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
	},
	"maimaidx:Single": {
		idString: "maimaidx:Single",

		percentMax: 101,

		defaultScoreRatingAlg: "rate",
		defaultSessionRatingAlg: "rate",
		defaultProfileRatingAlg: "naiveRate",

		scoreRatingAlgs: ["rate"],
		sessionRatingAlgs: ["rate"],
		profileRatingAlgs: ["naiveRate", "rate"],

		scoreRatingAlgDescriptions: {
			rate: "Rating as it's implemented in game.",
		},
		profileRatingAlgDescriptions: {
			naiveRate: "A naive rating algorithm that just sums your 50 best scores.",
			rate: "Rating as it's implemented in game, taking 15 scores from the latest version and 35 from all old versions.",
		},
		sessionRatingAlgDescriptions: {
			rate: "The average of your best 10 ratings this session.",
		},

		scoreRatingAlgFormatters: {
			rate: FormatMaimaiDXRating,
		},
		profileRatingAlgFormatters: {
			naiveRate: FormatMaimaiDXRating,
			rate: FormatMaimaiDXRating,
		},
		sessionRatingAlgFormatters: {
			rate: FormatMaimaiDXRating,
		},

		difficultyOrder: [
			"Basic",
			"Advanced",
			"Expert",
			"Master",
			"Re:Master",
			"DX Basic",
			"DX Advanced",
			"DX Expert",
			"DX Master",
			"DX Re:Master",
		],
		difficultyShorthand: {
			Basic: "BAS",
			Advanced: "ADV",
			Expert: "EXP",
			Master: "MAS",
			"Re:Master": "Re:MAS",
			"DX Basic": "DX BAS",
			"DX Advanced": "DX ADV",
			"DX Expert": "DX EXP",
			"DX Master": "DX MAS",
			"DX Re:Master": "DX Re:MAS",
		},
		defaultDifficulty: "Master",
		difficultyColours: {
			Basic: COLOUR_SET.green,
			Advanced: COLOUR_SET.orange,
			Expert: COLOUR_SET.red,
			Master: COLOUR_SET.purple,
			"Re:Master": COLOUR_SET.white,
			"DX Basic": COLOUR_SET.green,
			"DX Advanced": COLOUR_SET.orange,
			"DX Expert": COLOUR_SET.red,
			"DX Master": COLOUR_SET.purple,
			"DX Re:Master": COLOUR_SET.white,
		},

		orderedGrades: [
			"D",
			"C",
			"B",
			"BB",
			"BBB",
			"A",
			"AA",
			"AAA",
			"S",
			"S+",
			"SS",
			"SS+",
			"SSS",
			"SSS+",
		],
		gradeColours: {
			D: COLOUR_SET.gray,
			C: COLOUR_SET.red,
			B: COLOUR_SET.maroon,
			BB: COLOUR_SET.purple,
			BBB: COLOUR_SET.paleGreen,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.paleBlue,
			AAA: COLOUR_SET.blue,
			S: COLOUR_SET.gold,
			"S+": COLOUR_SET.vibrantYellow,
			SS: COLOUR_SET.paleOrange,
			"SS+": COLOUR_SET.orange,
			SSS: COLOUR_SET.teal,
			"SSS+": COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		gradeBoundaries: [0, 10, 20, 40, 60, 80, 90, 94, 97, 98, 99, 99.5, 100, 100.5],

		orderedLamps: [
			"FAILED",
			"CLEAR",
			"FULL COMBO",
			"FULL COMBO+",
			"ALL PERFECT",
			"ALL PERFECT+",
		],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"FULL COMBO": COLOUR_SET.blue,
			"FULL COMBO+": COLOUR_SET.paleBlue,
			"ALL PERFECT": COLOUR_SET.gold,
			"ALL PERFECT+": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			colour: MaimaiDXColours,
			dan: MaimaiDXDans,
		},
		classProperties: {
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
			dan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: false,
		judgements: ["pcrit", "perfect", "great", "good", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["universeplus"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["songTitle", "tachiSongID"],
	},
	"gitadora:Gita": {
		idString: "gitadora:Gita",

		percentMax: 100,

		defaultScoreRatingAlg: "skill",
		defaultSessionRatingAlg: "skill",
		defaultProfileRatingAlg: "skill",

		scoreRatingAlgs: ["skill"],
		sessionRatingAlgs: ["skill"],
		profileRatingAlgs: ["skill"],

		scoreRatingAlgDescriptions: {
			skill: "Skill Rating as it's implemented in game.",
		},
		profileRatingAlgDescriptions: {
			skill: "Your profile skill as it's implemented in game -- 25 HOT and 25 not HOT.",
			naiveSkill:
				"Your best 50 skill levels added together, regardless of whether the chart is HOT or not.",
		},
		sessionRatingAlgDescriptions: {
			skill: "The average of your best 10 skill ratings this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: [
			"BASIC",
			"ADVANCED",
			"EXTREME",
			"MASTER",
			"BASS BASIC",
			"BASS ADVANCED",
			"BASS EXTREME",
			"BASS MASTER",
		],
		difficultyShorthand: {
			BASIC: "G-BSC",
			ADVANCED: "G-ADV",
			EXTREME: "G-EXT",
			MASTER: "G-MAS",
			"BASS BASIC": "B-BSC",
			"BASS ADVANCED": "B-ADV",
			"BASS EXTREME": "B-EXT",
			"BASS MASTER": "B-MAS",
		},
		defaultDifficulty: "EXTREME",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXTREME: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
			"BASS BASIC": COLOUR_SET.vibrantBlue,
			"BASS ADVANCED": COLOUR_SET.vibrantOrange,
			"BASS EXTREME": COLOUR_SET.vibrantRed,
			"BASS MASTER": COLOUR_SET.vibrantPurple,
		},

		orderedGrades: ["C", "B", "A", "S", "SS", "MAX"],
		gradeColours: {
			C: COLOUR_SET.purple,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			S: COLOUR_SET.orange,
			SS: COLOUR_SET.gold,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",
		gradeBoundaries: [0, 63, 73, 80, 95, 100],

		orderedLamps: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			EXCELLENT: COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			colour: GitadoraColours,
		},
		classProperties: {
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["perfect", "great", "good", "ok", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["konaste"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
	},
	"gitadora:Dora": {
		idString: "gitadora:Dora",

		percentMax: 100,

		defaultScoreRatingAlg: "skill",
		defaultSessionRatingAlg: "skill",
		defaultProfileRatingAlg: "skill",

		scoreRatingAlgs: ["skill"],
		sessionRatingAlgs: ["skill"],
		profileRatingAlgs: ["skill"],

		scoreRatingAlgDescriptions: {
			skill: "Skill Rating as it's implemented in game.",
		},
		profileRatingAlgDescriptions: {
			skill: "Your profile skill as it's implemented in game -- 25 HOT and 25 not HOT.",
			naiveSkill:
				"Your best 50 skill levels added together, regardless of whether the chart is HOT or not.",
		},
		sessionRatingAlgDescriptions: {
			skill: "The average of your best 10 skill ratings this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: ["BASIC", "ADVANCED", "EXTREME", "MASTER"],
		difficultyShorthand: {
			BASIC: "D-BSC",
			ADVANCED: "D-ADV",
			EXTREME: "D-EXT",
			MASTER: "D-MAS",
		},
		defaultDifficulty: "EXTREME",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXTREME: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
		},

		orderedGrades: ["C", "B", "A", "S", "SS", "MAX"],
		gradeColours: {
			C: COLOUR_SET.purple,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			S: COLOUR_SET.orange,
			SS: COLOUR_SET.gold,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",
		gradeBoundaries: [0, 63, 73, 80, 95, 100],

		orderedLamps: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			EXCELLENT: COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			colour: GitadoraColours,
		},
		classProperties: {
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["perfect", "great", "good", "ok", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["konaste"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
	},
	"wacca:Single": {
		idString: "wacca:Single",

		percentMax: 100,

		defaultScoreRatingAlg: "rate",
		defaultSessionRatingAlg: "rate",
		defaultProfileRatingAlg: "naiveRate",

		scoreRatingAlgs: ["rate"],
		sessionRatingAlgs: ["rate"],
		profileRatingAlgs: ["naiveRate", "rate"],

		scoreRatingAlgDescriptions: {
			rate: "Rating as it's implemented in game.",
		},
		profileRatingAlgDescriptions: {
			naiveRate: "A naive rating algorithm that just sums your 50 best scores.",
			rate: "Rating as it's implemented in game, taking 15 scores from the latest version and 35 from all old versions.",
		},
		sessionRatingAlgDescriptions: {
			rate: "The average of your best 10 ratings this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: ["NORMAL", "HARD", "EXPERT", "INFERNO"],
		difficultyShorthand: {
			NORMAL: "NRM",
			HARD: "HRD",
			EXPERT: "EXP",
			INFERNO: "INF",
		},
		defaultDifficulty: "EXPERT",
		difficultyColours: {
			NORMAL: COLOUR_SET.blue,
			HARD: COLOUR_SET.gold,
			EXPERT: COLOUR_SET.pink,
			INFERNO: COLOUR_SET.purple,
		},

		orderedGrades: [
			"D",
			"C",
			"B",
			"A",
			"AA",
			"AAA",
			"S",
			"S+",
			"SS",
			"SS+",
			"SSS",
			"SSS+",
			"MASTER",
		],
		gradeColours: {
			D: COLOUR_SET.gray,
			C: COLOUR_SET.maroon,
			B: COLOUR_SET.red,
			A: COLOUR_SET.paleGreen,
			AA: COLOUR_SET.green,
			AAA: COLOUR_SET.vibrantGreen,
			S: COLOUR_SET.gold,
			"S+": COLOUR_SET.vibrantYellow,
			SS: COLOUR_SET.paleOrange,
			"SS+": COLOUR_SET.orange,
			SSS: COLOUR_SET.pink,
			"SSS+": COLOUR_SET.vibrantPink,
			MASTER: COLOUR_SET.white,
		},
		minimumRelevantGrade: "S",

		// i'm pretty sure the first grade is below the limit of reliable FPA accuracy
		gradeBoundaries: [0, 0.0001, 3.0001, 70, 80, 85, 90, 93, 95, 97, 98, 99, 100],

		orderedLamps: ["FAILED", "CLEAR", "MISSLESS", "FULL COMBO", "ALL MARVELOUS"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			MISSLESS: COLOUR_SET.orange,
			"FULL COMBO": COLOUR_SET.pink,
			"ALL MARVELOUS": COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			stageUp: WaccaStageUps,
			colour: WaccaColours,
		},
		classProperties: {
			stageUp: { downgradable: false, canBeBatchManualSubmitted: true },
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["marvelous", "great", "good", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: ["reverse"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["songTitle", "tachiSongID"],
	},
	"popn:9B": {
		idString: "popn:9B",

		percentMax: 100,

		defaultScoreRatingAlg: "classPoints",
		defaultSessionRatingAlg: "classPoints",
		defaultProfileRatingAlg: "naiveClassPoints",

		scoreRatingAlgs: ["classPoints"],
		sessionRatingAlgs: ["classPoints"],
		profileRatingAlgs: ["naiveClassPoints"],

		scoreRatingAlgDescriptions: {
			classPoints: "Class Points as they're implemented in game.",
		},
		profileRatingAlgDescriptions: {
			naiveClassPoints:
				"A naive average of your best 20 scores. This is different to in game class points, as that is affected by recent scores, and not just your best scores.",
		},
		sessionRatingAlgDescriptions: {
			classPoints: "The average of your best 10 class points this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: ["Easy", "Normal", "Hyper", "EX"],
		difficultyShorthand: {
			Easy: "E",
			Normal: "N",
			Hyper: "H",
			EX: "EX",
		},
		defaultDifficulty: "EX",
		difficultyColours: {
			Easy: COLOUR_SET.blue,
			Normal: COLOUR_SET.green,
			Hyper: COLOUR_SET.orange,
			EX: COLOUR_SET.red,
		},

		orderedGrades: ["E", "D", "C", "B", "A", "AA", "AAA", "S"],
		gradeColours: {
			E: COLOUR_SET.gray,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.red,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.orange,
			AAA: COLOUR_SET.gold,
			S: COLOUR_SET.teal,
		},
		minimumRelevantGrade: "A",

		// TECHNICALLY THIS IS NOT CORRECT
		// A Fail is capped at A rank (82%), no matter what!
		gradeBoundaries: [0, 50, 62, 72, 82, 90, 95, 98],

		orderedLamps: ["FAILED", "EASY CLEAR", "CLEAR", "FULL COMBO", "PERFECT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			PERFECT: COLOUR_SET.gold,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			class: PopnClasses,
		},
		classProperties: {
			class: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["cool", "great", "good", "bad"],

		scoreBucket: "lamp",

		orderedSupportedVersions: ["peace", "kaimei"],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["inGameID", "tachiSongID", "popnChartHash"],
	},
	"jubeat:Single": {
		idString: "jubeat:Single",

		percentMax: 120,

		defaultScoreRatingAlg: "jubility",
		defaultSessionRatingAlg: "jubility",
		defaultProfileRatingAlg: "jubility",

		scoreRatingAlgs: ["jubility"],
		sessionRatingAlgs: ["jubility"],
		profileRatingAlgs: ["jubility", "naiveJubility"],

		scoreRatingAlgDescriptions: {
			jubility: "Jubility as it's implemented in game.",
		},
		profileRatingAlgDescriptions: {
			jubility:
				"Your profile jubility. This takes your best 30 scores on PICK UP songs, and your best 30 elsewhere.",
			naiveJubility:
				"A naive version of jubility which just adds together your best 60 scores.",
		},
		sessionRatingAlgDescriptions: {
			jubility: "The average of your best 10 jubilities this session.",
		},

		scoreRatingAlgFormatters: {},
		profileRatingAlgFormatters: {},
		sessionRatingAlgFormatters: {},

		difficultyOrder: ["BSC", "ADV", "EXT", "HARD BSC", "HARD ADV", "HARD EXT"],
		difficultyShorthand: {
			BSC: "BSC",
			ADV: "ADV",
			EXT: "EXT",
			"HARD BSC": "H. BSC",
			"HARD ADV": "H. ADV",
			"HARD EXT": "H. EXT",
		},
		defaultDifficulty: "EXT",
		difficultyColours: {
			BSC: COLOUR_SET.green,
			ADV: COLOUR_SET.gold,
			EXT: COLOUR_SET.red,
			"HARD BSC": COLOUR_SET.darkGreen,
			"HARD ADV": COLOUR_SET.orange,
			"HARD EXT": COLOUR_SET.vibrantRed,
		},

		orderedGrades: ["E", "D", "C", "B", "A", "S", "SS", "SSS", "EXC"],
		gradeColours: {
			E: COLOUR_SET.gray,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.red,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			S: COLOUR_SET.gold,
			SS: COLOUR_SET.orange,
			SSS: COLOUR_SET.teal,
			EXC: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",
		gradeBoundaries: [0, 50, 70, 80, 85, 90, 95, 98, 100],

		orderedLamps: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			EXCELLENT: COLOUR_SET.white,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			colour: JubeatColours,
		},
		classProperties: {
			colour: { downgradable: true, canBeBatchManualSubmitted: false },
		},

		supportsESD: false,
		judgements: ["perfect", "great", "good", "poor", "miss"],

		scoreBucket: "grade",

		orderedSupportedVersions: [
			"jubeat",
			"ripples",
			"knit",
			"copious",
			"saucer",
			"prop",
			"qubell",
			"clan",
			"festo",
		],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["inGameID", "tachiSongID"],
	},
	"pms:Controller": {
		idString: "pms:Controller",
		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		scoreRatingAlgs: ["sieglinde"],
		sessionRatingAlgs: ["sieglinde"],
		profileRatingAlgs: ["sieglinde"],

		scoreRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},
		profileRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},
		sessionRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},

		scoreRatingAlgDescriptions: {
			sieglinde:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
		},
		profileRatingAlgDescriptions: {
			sieglinde: "The average of your best 20 sieglinde ratings.",
		},
		sessionRatingAlgDescriptions: {
			sieglinde: "The average of your best 10 sieglinde ratings this session.",
		},

		difficultyOrder: ["CHART"],
		difficultyShorthand: {},
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		// see iidx:SP for an explaination of why this is wrote like this.
		gradeBoundaries: [
			0,
			(100 * 2) / 9,
			(100 * 3) / 9,
			(100 * 4) / 9,
			(100 * 5) / 9,
			(100 * 6) / 9,
			(100 * 7) / 9,
			(100 * 8) / 9,
			(100 * 17) / 18,
			(100 * 9) / 9,
		],

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			dan: PMSDans,
		},
		classProperties: {
			dan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: false,
		judgements: ["cool", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [],

		tierlists: ["sgl-EC", "sgl-HC"],
		tierlistDescriptions: {
			"sgl-EC": "Sieglinde Easy Clear ratings.",
			"sgl-HC": "Sieglinde Hard Clear ratings.",
		},

		supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
	},
	"pms:Keyboard": {
		idString: "pms:Keyboard",
		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		scoreRatingAlgs: ["sieglinde"],
		sessionRatingAlgs: ["sieglinde"],
		profileRatingAlgs: ["sieglinde"],

		scoreRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},
		profileRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},
		sessionRatingAlgFormatters: {
			sieglinde: FormatSieglindePMS,
		},

		scoreRatingAlgDescriptions: {
			sieglinde:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
		},
		profileRatingAlgDescriptions: {
			sieglinde: "The average of your best 20 sieglinde ratings.",
		},
		sessionRatingAlgDescriptions: {
			sieglinde: "The average of your best 10 sieglinde ratings this session.",
		},

		difficultyOrder: ["CHART"],
		difficultyShorthand: {},
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		orderedGrades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleBlue,
			A: COLOUR_SET.green,
			AA: COLOUR_SET.blue,
			AAA: COLOUR_SET.gold,
			"MAX-": COLOUR_SET.teal,
			MAX: COLOUR_SET.white,
		},
		minimumRelevantGrade: "A",

		// see iidx:SP for an explaination of why this is wrote like this.
		gradeBoundaries: [
			0,
			(100 * 2) / 9,
			(100 * 3) / 9,
			(100 * 4) / 9,
			(100 * 5) / 9,
			(100 * 6) / 9,
			(100 * 7) / 9,
			(100 * 8) / 9,
			(100 * 17) / 18,
			(100 * 9) / 9,
		],

		orderedLamps: [
			"NO PLAY",
			"FAILED",
			"ASSIST CLEAR",
			"EASY CLEAR",
			"CLEAR",
			"HARD CLEAR",
			"EX HARD CLEAR",
			"FULL COMBO",
		],
		lampColours: {
			"NO PLAY": COLOUR_SET.gray,
			FAILED: COLOUR_SET.red,
			"ASSIST CLEAR": COLOUR_SET.purple,
			"EASY CLEAR": COLOUR_SET.green,
			CLEAR: COLOUR_SET.blue,
			"HARD CLEAR": COLOUR_SET.orange,
			"EX HARD CLEAR": COLOUR_SET.gold,
			"FULL COMBO": COLOUR_SET.teal,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {
			dan: PMSDans,
		},
		classProperties: {
			dan: { downgradable: false, canBeBatchManualSubmitted: true },
		},

		supportsESD: false,
		judgements: ["cool", "great", "good", "bad", "poor"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [],

		tierlists: ["sgl-EC", "sgl-HC"],
		tierlistDescriptions: {
			"sgl-EC": "Sieglinde Easy Clear ratings.",
			"sgl-HC": "Sieglinde Hard Clear ratings.",
		},

		supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
	},
	"itg:Stamina": {
		idString: "itg:Stamina",

		percentMax: 100,

		defaultScoreRatingAlg: "blockRating",
		defaultSessionRatingAlg: "blockRating",
		defaultProfileRatingAlg: "highestBlock",

		scoreRatingAlgs: ["blockRating", "highest32", "highest256"],
		sessionRatingAlgs: ["blockRating", "average32Speed"],
		profileRatingAlgs: ["highest32", "highestBlock", "highest256"],

		scoreRatingAlgDescriptions: {
			blockRating: "How much this clear is worth.",
			highest32: "The highest BPM this score streamed 32 measures straight for.",
			highest256: "The highest BPM this score streamed 256 measures straight for.",
		},
		profileRatingAlgDescriptions: {
			highest32: "The highest BPM this user has streamed 32 unbroken measures at.",
			highest256: "The highest BPM this user has streamed 256 unbroken measures at.",
			highestBlock: "The highest block level this player has cleared.",
		},
		sessionRatingAlgDescriptions: {
			blockRating: "An average of your best 5 blsock levels cleared this session.",
			average32Speed: "An average of your fastest 5 32 measure runs this session.",
		},

		// always round these
		scoreRatingAlgFormatters: {
			highest256: (k) => k.toFixed(0),
			highest32: (k) => k.toFixed(0),
			blockRating: (k) => k.toFixed(0),
		},
		profileRatingAlgFormatters: {
			highest256: (k) => k.toFixed(0),
			highest32: (k) => k.toFixed(0),
			highestBlock: (k) => k.toFixed(0),
		},
		sessionRatingAlgFormatters: {},

		// This is quirky (lol)
		// ITG difficulties can be any string they want to be. We just support some
		// hardcoded defaults.
		difficultyOrder: ["Beginner", "Easy", "Medium", "Hard", "Challenge"],
		difficultyShorthand: {
			Beginner: "B",
			Easy: "E",
			Medium: "M",
			Hard: "H",
			Challenge: "C",
		},
		defaultDifficulty: "Challenge",
		difficultyColours: {
			Beginner: COLOUR_SET.paleBlue,
			Easy: COLOUR_SET.green,
			Medium: COLOUR_SET.vibrantYellow,
			Hard: COLOUR_SET.red,
			Challenge: COLOUR_SET.pink,
		},

		orderedGrades: ["D", "C", "B", "A", "S-", "S", "S+", "★", "★★", "★★★", "★★★★"],
		gradeColours: {
			D: COLOUR_SET.red,
			C: COLOUR_SET.maroon,
			B: COLOUR_SET.purple,
			A: COLOUR_SET.green,
			"S-": COLOUR_SET.paleOrange,
			S: COLOUR_SET.orange,
			"S+": COLOUR_SET.vibrantOrange,
			"★": COLOUR_SET.pink,
			"★★": COLOUR_SET.vibrantPink,
			"★★★": COLOUR_SET.teal,
			"★★★★": COLOUR_SET.white,
		},
		minimumRelevantGrade: "C",
		gradeBoundaries: [0, 55, 68, 80, 89, 92, 94, 96, 98, 99, 100],

		orderedLamps: ["FAILED", "CLEAR", "FULL COMBO", "FULL EXCELLENT COMBO", "QUAD"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.pink,
			"FULL EXCELLENT COMBO": COLOUR_SET.gold,
			QUAD: COLOUR_SET.white,
		},
		minimumRelevantLamp: "CLEAR",

		classHumanisedFormat: {},
		classProperties: {},

		supportsESD: false,
		judgements: ["fantastic", "excellent", "great", "decent", "wayoff", "miss"],

		scoreBucket: "lamp",

		orderedSupportedVersions: [],

		tierlists: [],
		tierlistDescriptions: {},

		supportedMatchTypes: ["itgChartHash", "tachiSongID"],
	},
} as const satisfies Record<GPTStrings, INTERNAL_GamePTConfig>;
