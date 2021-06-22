# Game Configuration

Tachi has two sets of game configurations.

The first is on the game level, which contains things
like the humanised name for the game (i.e. `iidx -> beatmania IIDX`).

The second is for each individual game + playtype
combination, which contains things like the list of
lamps for the game.

!!! help
	This page is currently unformatted,
	and is pretty much just a copy-paste of the
	local configuration files.

	It would be really appreciated if someone formatted
	the configurations for every game! For the time being,
	the below documentation is just the raw configuration
	for each game. Please see [Contributing to Tachi](../contributing.md).

*****

## Game Configurations

```ts
const GAME_CONFIGS: GameConfigs = {
	iidx: {
		defaultPlaytype: "SP",
		name: "beatmania IIDX",
		internalName: "iidx",
		validPlaytypes: ["SP", "DP"],
	},
	museca: {
		defaultPlaytype: "Single",
		name: "MÚSECA",
		internalName: "museca",
		validPlaytypes: ["Single"],
	},
	chunithm: {
		defaultPlaytype: "Single",
		name: "CHUNITHM",
		internalName: "chunithm",
		validPlaytypes: ["Single"],
	},
	ddr: {
		defaultPlaytype: "SP",
		name: "DDR", // used to be 'Dance Dance Revolution', is now DDR for space reasons.
		internalName: "ddr",
		validPlaytypes: ["SP", "DP"],
	},
	bms: {
		defaultPlaytype: "7K",
		name: "BMS",
		internalName: "bms",
		validPlaytypes: ["7K", "14K"],
	},
	gitadora: {
		defaultPlaytype: "Dora",
		name: "GITADORA",
		internalName: "gitadora",
		validPlaytypes: ["Gita", "Dora"],
	},
	maimai: {
		defaultPlaytype: "Single",
		name: "maimai",
		internalName: "maimai",
		validPlaytypes: ["Single"],
	},
	sdvx: {
		defaultPlaytype: "Single",
		name: "SOUND VOLTEX",
		internalName: "sdvx",
		validPlaytypes: ["Single"],
	},
	usc: {
		defaultPlaytype: "Single",
		name: "unnamed_sdvx_clone",
		internalName: "usc",
		validPlaytypes: ["Single"],
	},
};
```

## Game + Playtype Configurations

```ts
const GAME_PT_CONFIGS: GamePTConfigs = {
	"iidx:SP": {
		idString: "iidx:SP",

		percentMax: 100,

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"],
		defaultDifficulty: "ANOTHER",
		difficultyColours: {
			BEGINNER: COLOUR_SET.paleGreen,
			NORMAL: COLOUR_SET.blue,
			HYPER: COLOUR_SET.orange,
			ANOTHER: COLOUR_SET.red,
			LEGGENDARIA: COLOUR_SET.purple,
		},

		grades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
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
		clearGrade: "A",
		gradeBoundaries: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],

		lamps: [
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
		clearLamp: "CLEAR",

		supportsESD: true,
		judgementWindows: [
			{ name: "PGREAT", msBorder: 16.667, value: 2 },
			{ name: "GREAT", msBorder: 33.333, value: 1 },
			{ name: "GOOD", msBorder: 116.667, value: 0 },
		],
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "lamp",
	},
	"iidx:DP": {
		idString: "iidx:DP",

		percentMax: 100,

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"],
		defaultDifficulty: "ANOTHER",
		difficultyColours: {
			NORMAL: COLOUR_SET.blue,
			HYPER: COLOUR_SET.orange,
			ANOTHER: COLOUR_SET.red,
			LEGGENDARIA: COLOUR_SET.purple,
		},

		grades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
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
		clearGrade: "A",
		gradeBoundaries: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],

		lamps: [
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
		clearLamp: "CLEAR",

		supportsESD: true,
		judgementWindows: [
			{ name: "PGREAT", msBorder: 16.667, value: 2 },
			{ name: "GREAT", msBorder: 33.333, value: 1 },
			{ name: "GOOD", msBorder: 116.667, value: 0 },
		],
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "lamp",
	},
	"chunithm:Single": {
		idString: "chunithm:Single",
		percentMax: 101,

		defaultScoreRatingAlg: "rating",
		defaultSessionRatingAlg: "naiveRating",
		defaultProfileRatingAlg: "naiveRating",

		difficulties: ["BASIC", "ADVANCED", "EXPERT", "MASTER", "WORLD'S END"],
		defaultDifficulty: "MASTER",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXPERT: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
			"WORLD'S END": COLOUR_SET.vibrantYellow,
		},

		grades: ["D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS"],
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
		clearGrade: "A",
		gradeBoundaries: [0, 50, 60, 70, 80, 90, 92.5, 95.0, 97.5, 100, 107.5, 101],

		lamps: ["FAILED", "CLEAR", "FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.paleGreen,
			"FULL COMBO": COLOUR_SET.paleBlue,
			"ALL JUSTICE": COLOUR_SET.gold,
			"ALL JUSTICE CRITICAL": COLOUR_SET.white,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["jcrit", "justice", "attack", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
	"sdvx:Single": {
		idString: "sdvx:Single",
		percentMax: 100,

		defaultScoreRatingAlg: "VF6",
		defaultSessionRatingAlg: "ProfileVF6",
		defaultProfileRatingAlg: "VF6",

		difficulties: ["NOV", "ADV", "EXH", "INF", "GRV", "HVN", "VVD", "MXM"],
		defaultDifficulty: "EXH",
		difficultyColours: {
			NOV: COLOUR_SET.purple, // colour set dark purple
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: "TODO", // colour set light pink
			GRV: COLOUR_SET.orange,
			HVN: COLOUR_SET.teal,
			VVD: "TODO", // colour set pink
			MXM: COLOUR_SET.white,
		},

		grades: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S"],
		gradeColours: {
			D: COLOUR_SET.gray,
			C: COLOUR_SET.red,
			B: COLOUR_SET.maroon,
			A: COLOUR_SET.paleBlue,
			"A+": COLOUR_SET.blue,
			AA: COLOUR_SET.paleGreen,
			"AA+": COLOUR_SET.green,
			AAA: COLOUR_SET.gold,
			"AAA+": COLOUR_SET.vibrantYellow,
			S: COLOUR_SET.teal,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99],

		lamps: ["FAILED", "CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN", "PERFECT ULTIMATE CHAIN"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"EXCESSIVE CLEAR": COLOUR_SET.orange,
			"ULTIMATE CHAIN": COLOUR_SET.teal,
			"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["critical", "near", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
	"usc:Single": {
		idString: "usc:Single",
		percentMax: 100,

		defaultScoreRatingAlg: "VF6",
		defaultSessionRatingAlg: "ProfileVF6",
		defaultProfileRatingAlg: "VF6",

		difficulties: ["NOV", "ADV", "EXH", "INF"],
		defaultDifficulty: "EXH",
		difficultyColours: {
			NOV: COLOUR_SET.purple, // colour set dark purple
			ADV: COLOUR_SET.vibrantYellow,
			EXH: COLOUR_SET.red,
			INF: "TODO", // colour set light pink
		},

		grades: ["D", "C", "B", "A", "A+", "AA", "AA+", "AAA", "AAA+", "S"],
		gradeColours: {
			D: COLOUR_SET.gray,
			C: COLOUR_SET.red,
			B: COLOUR_SET.maroon,
			A: COLOUR_SET.paleBlue,
			"A+": COLOUR_SET.blue,
			AA: COLOUR_SET.paleGreen,
			"AA+": COLOUR_SET.green,
			AAA: COLOUR_SET.gold,
			"AAA+": COLOUR_SET.vibrantYellow,
			S: COLOUR_SET.teal,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 70, 80, 87, 90, 93, 95, 97, 98, 99],

		lamps: ["FAILED", "CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN", "PERFECT ULTIMATE CHAIN"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"EXCESSIVE CLEAR": COLOUR_SET.orange,
			"ULTIMATE CHAIN": COLOUR_SET.teal,
			"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["critical", "near", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
	"museca:Single": {
		idString: "museca:Single",
		percentMax: 100,

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["Green", "Yellow", "Red"],
		defaultDifficulty: "Red",
		difficultyColours: {
			Green: COLOUR_SET.green,
			Yellow: COLOUR_SET.vibrantYellow,
			Red: COLOUR_SET.red,
		},

		grades: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],
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
		clearGrade: "良",
		gradeBoundaries: [0, 60, 70, 80, 85, 90, 95, 97.5, 100],

		lamps: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"CONNECT ALL": COLOUR_SET.teal,
			"PERFECT CONNECT ALL": COLOUR_SET.gold,
		},
		clearLamp: "CLEAR",

		supportsESD: true,
		judgementWindows: [
			{ name: "CRITICAL", msBorder: 33.333, value: 2 },
			{ name: "NEAR", msBorder: 66.667, value: 1 },
		],
		judgements: ["critical", "near", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
	"bms:7K": {
		idString: "bms:7K",
		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		difficulties: ["CHART"],
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		grades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
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
		clearGrade: "A",
		gradeBoundaries: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],

		lamps: [
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
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		defaultTable: "Insane",

		scoreBucket: "lamp",
	},
	"bms:14K": {
		idString: "bms:14K",

		percentMax: 100,

		defaultScoreRatingAlg: "sieglinde",
		defaultSessionRatingAlg: "sieglinde",
		defaultProfileRatingAlg: "sieglinde",

		difficulties: ["CHART"],
		defaultDifficulty: "CHART",
		difficultyColours: {
			CHART: null,
		},

		grades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
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
		clearGrade: "A",
		gradeBoundaries: [0, 22.22, 33.33, 44.44, 55.55, 66.66, 77.77, 88.88, 94.44, 100.0],

		lamps: [
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
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["pgreat", "great", "good", "bad", "poor"],

		defaultTable: "Insane",

		scoreBucket: "lamp",
	},
	"ddr:SP": {
		idString: "ddr:SP",

		percentMax: 100,

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["BEGINNER", "BASIC", "DIFFICULT", "EXPERT", "CHALLENGE"],
		defaultDifficulty: "EXPERT",
		difficultyColours: {
			BEGINNER: COLOUR_SET.paleBlue,
			BASIC: COLOUR_SET.orange,
			DIFFICULT: COLOUR_SET.red,
			EXPERT: COLOUR_SET.green,
			CHALLENGE: COLOUR_SET.purple,
		},

		grades: [
			"D",
			"D+",
			"C-",
			"C",
			"C+",
			"B-",
			"B",
			"B+",
			"A-",
			"A",
			"A+",
			"AA-",
			"AA",
			"AA+",
			"AAA",
		],
		gradeColours: {
			D: COLOUR_SET.gray,
			"D+": COLOUR_SET.maroon,
			"C-": COLOUR_SET.red,
			C: COLOUR_SET.purple,
			"C+": COLOUR_SET.vibrantPurple,
			"B-": COLOUR_SET.paleBlue,
			B: COLOUR_SET.blue,
			"B+": COLOUR_SET.vibrantBlue,
			"A-": COLOUR_SET.paleGreen,
			A: COLOUR_SET.green,
			"A+": COLOUR_SET.vibrantGreen,
			"AA-": COLOUR_SET.paleOrange,
			AA: COLOUR_SET.orange,
			"AA+": COLOUR_SET.vibrantOrange,
			AAA: COLOUR_SET.gold,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 55, 59, 60, 65, 69, 70, 75, 79, 80, 85, 89, 90, 95, 99],

		lamps: [
			"FAILED",
			"CLEAR",
			"LIFE4",
			"FULL COMBO",
			"GREAT FULL COMBO",
			"PERFECT FULL COMBO",
			"MARVELOUS FULL COMBO",
		],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.paleGreen,
			LIFE4: COLOUR_SET.orange,
			"FULL COMBO": COLOUR_SET.paleBlue,
			"GREAT FULL COMBO": COLOUR_SET.green,
			"PERFECT FULL COMBO": COLOUR_SET.gold,
			"MARVELOUS FULL COMBO": COLOUR_SET.teal,
		},
		clearLamp: "CLEAR",

		supportsESD: true,
		judgementWindows: [
			{ name: "MARVELOUS", msBorder: 15, value: 3 },
			{ name: "PERFECT", msBorder: 30, value: 2 },
			{ name: "GREAT", msBorder: 59, value: 1 },
			{ name: "GOOD", msBorder: 89, value: 0 },
			{ name: "BAD", msBorder: 119, value: 0 },
		],
		judgements: ["marvelous", "perfect", "great", "good", "boo", "miss", "ok", "ng"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "lamp",
	},
	"ddr:DP": {
		idString: "ddr:DP",

		percentMax: 100,

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["BASIC", "DIFFICULT", "EXPERT", "CHALLENGE"],
		defaultDifficulty: "EXPERT",
		difficultyColours: {
			BASIC: COLOUR_SET.orange,
			DIFFICULT: COLOUR_SET.red,
			EXPERT: COLOUR_SET.green,
			CHALLENGE: COLOUR_SET.purple,
		},

		grades: [
			"D",
			"D+",
			"C-",
			"C",
			"C+",
			"B-",
			"B",
			"B+",
			"A-",
			"A",
			"A+",
			"AA-",
			"AA",
			"AA+",
			"AAA",
		],
		gradeColours: {
			D: COLOUR_SET.gray,
			"D+": COLOUR_SET.maroon,
			"C-": COLOUR_SET.red,
			C: COLOUR_SET.purple,
			"C+": COLOUR_SET.vibrantPurple,
			"B-": COLOUR_SET.paleBlue,
			B: COLOUR_SET.blue,
			"B+": COLOUR_SET.vibrantBlue,
			"A-": COLOUR_SET.paleGreen,
			A: COLOUR_SET.green,
			"A+": COLOUR_SET.vibrantGreen,
			"AA-": COLOUR_SET.paleOrange,
			AA: COLOUR_SET.orange,
			"AA+": COLOUR_SET.vibrantOrange,
			AAA: COLOUR_SET.gold,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 55, 59, 60, 65, 69, 70, 75, 79, 80, 85, 89, 90, 95, 99],

		lamps: [
			"FAILED",
			"CLEAR",
			"LIFE4",
			"FULL COMBO",
			"GREAT FULL COMBO",
			"PERFECT FULL COMBO",
			"MARVELOUS FULL COMBO",
		],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.paleGreen,
			LIFE4: COLOUR_SET.orange,
			"FULL COMBO": COLOUR_SET.paleBlue,
			"GREAT FULL COMBO": COLOUR_SET.green,
			"PERFECT FULL COMBO": COLOUR_SET.gold,
			"MARVELOUS FULL COMBO": COLOUR_SET.teal,
		},
		clearLamp: "CLEAR",

		supportsESD: true,
		judgementWindows: [
			{ name: "MARVELOUS", msBorder: 15, value: 3 },
			{ name: "PERFECT", msBorder: 30, value: 2 },
			{ name: "GREAT", msBorder: 59, value: 1 },
			{ name: "GOOD", msBorder: 89, value: 0 },
			{ name: "BAD", msBorder: 119, value: 0 },
		],
		judgements: ["marvelous", "perfect", "great", "good", "boo", "miss", "ok", "ng"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "lamp",
	},
	"maimai:Single": {
		idString: "maimai:Single",

		percentMax: 120, // a safe estimate?

		defaultScoreRatingAlg: "ktRating",
		defaultSessionRatingAlg: "ktRating",
		defaultProfileRatingAlg: "ktRating",

		difficulties: ["Easy", "Basic", "Advanced", "Expert", "Master", "Re:Master"],
		defaultDifficulty: "Master",
		difficultyColours: {
			Easy: COLOUR_SET.blue,
			Basic: COLOUR_SET.green,
			Advanced: COLOUR_SET.orange,
			Expert: COLOUR_SET.red,
			Master: COLOUR_SET.purple,
			"Re:Master": COLOUR_SET.white,
		},

		grades: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "S", "S+", "SS", "SS+", "SSS", "SSS+"],
		gradeColours: {
			F: COLOUR_SET.gray,
			E: COLOUR_SET.red,
			D: COLOUR_SET.maroon,
			C: COLOUR_SET.purple,
			B: COLOUR_SET.paleGreen,
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
		clearGrade: "A",
		// @hack Maimai's top grade depends on the chart's maximum percent
		// we just set it at percentMax, but it's not technically correct
		gradeBoundaries: [0, 10, 20, 40, 60, 80, 90, 94, 97, 98, 99, 99.5, 100, 120],

		lamps: ["FAILED", "CLEAR", "FULL COMBO", "ALL PERFECT", "ALL PERFECT+"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.green,
			"FULL COMBO": COLOUR_SET.blue,
			"ALL PERFECT": COLOUR_SET.gold,
			"ALL PERFECT+": COLOUR_SET.teal,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["perfect", "great", "good", "miss"],

		defaultTable: "Levels",

		scoreBucket: "grade",
	},
	"gitadora:Gita": {
		idString: "gitadora:Gita",

		percentMax: 100,

		defaultScoreRatingAlg: "skill",
		defaultSessionRatingAlg: "skill",
		defaultProfileRatingAlg: "skill",

		difficulties: [
			"BASIC",
			"ADVANCED",
			"EXTREME",
			"MASTER",
			"BASS BASIC",
			"BASS ADVANCED",
			"BASS EXTREME",
			"BASS MASTER",
		],
		defaultDifficulty: "EXTREME",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXTREME: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
			"BASS BASIC": COLOUR_SET.vibrantBlue,
			"BASS ADVANCED": COLOUR_SET.vibrantOrange,
			"BASS EXTREME": "todo", // colourset vibrant red
			"BASS MASTER": COLOUR_SET.vibrantPurple,
		},

		grades: ["C", "B", "A", "S", "SS", "MAX"],
		gradeColours: {
			C: COLOUR_SET.purple,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			S: COLOUR_SET.orange,
			SS: COLOUR_SET.gold,
			MAX: COLOUR_SET.white,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 63, 73, 80, 95, 100],

		lamps: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			EXCELLENT: COLOUR_SET.gold,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["perfect", "great", "good", "ok", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
	"gitadora:Dora": {
		idString: "gitadora:Dora",

		percentMax: 100,

		defaultScoreRatingAlg: "skill",
		defaultSessionRatingAlg: "skill",
		defaultProfileRatingAlg: "skill",

		difficulties: ["BASIC", "ADVANCED", "EXTREME", "MASTER"],
		defaultDifficulty: "EXTREME",
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXTREME: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
		},

		grades: ["C", "B", "A", "S", "SS", "MAX"],
		gradeColours: {
			C: COLOUR_SET.purple,
			B: COLOUR_SET.blue,
			A: COLOUR_SET.green,
			S: COLOUR_SET.orange,
			SS: COLOUR_SET.gold,
			MAX: COLOUR_SET.white,
		},
		clearGrade: "A",
		gradeBoundaries: [0, 63, 73, 80, 95, 100],

		lamps: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
		lampColours: {
			FAILED: COLOUR_SET.red,
			CLEAR: COLOUR_SET.blue,
			"FULL COMBO": COLOUR_SET.teal,
			EXCELLENT: COLOUR_SET.gold,
		},
		clearLamp: "CLEAR",

		supportsESD: false,
		judgements: ["perfect", "great", "good", "ok", "miss"],

		defaultTable: "Levels (N-1)",

		scoreBucket: "grade",
	},
};
```