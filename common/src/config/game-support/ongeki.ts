import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtNum } from "../../utils/util";
import { ClassValue, ToDecimalPlaces } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const ONGEKI_CONF = {
	name: "O.N.G.E.K.I.",
	playtypes: ["Single"],
	songData: z.strictObject({
		genre: z.string(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

export const OngekiColours = [
	ClassValue("BLUE", "青", "Blue: 0 - 1.99 Rating"),
	ClassValue("GREEN", "緑", "Green: 2 - 3.99 Rating"),
	ClassValue("ORANGE", "橙", "Orange: 4 - 6.99 Rating"),
	ClassValue("RED", "赤", "Red: 7 - 9.99 Rating"),
	ClassValue("PURPLE", "紫", "Purple: 10 - 11.99 Rating"),
	ClassValue("COPPER", "銅", "Copper: 12 - 12.99 Rating"),
	ClassValue("SILVER", "銀", "Silver: 13 - 13.99 Rating"),
	ClassValue("GOLD", "金", "Gold: 14.00 - 14.49 Rating"),
	ClassValue("PLATINUM", "鉑", "Platinum: 14.50 - 14.99 Rating"),
	ClassValue("RAINBOW", "虹", "Rainbow: >=15 Rating"),
];

export const ONGEKI_SINGLE_CONF = {
	providedMetrics: {
		score: {
			type: "INTEGER",
			validate: p.isBetween(0, 1_010_000),
			formatter: FmtNum,
			description:
				"Known in-game as 'Technical Score'. It ranges between 0 and 1,010,000, where notes are worth 950,000, and bells 60,000.",
		},
		noteLamp: {
			type: "ENUM",
			values: ["LOSS", "CLEAR", "FULL COMBO", "ALL BREAK"],
			minimumRelevantValue: "CLEAR",
			description: "The primary lamp. A clear is either a draw or a win.",
		},
		bellLamp: {
			type: "ENUM",
			values: ["NONE", "FULL BELL"],
			minimumRelevantValue: "FULL BELL",
			description: "Tracks whether all bells in the chart have been collected.",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["D", "C", "B", "BB", "BBB", "A", "AA", "AAA", "S", "SS", "SSS", "SSS+"],
			minimumRelevantValue: "A",
			description: "The grade this score was.",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		damage: {
			type: "INTEGER",
			chartDependentMax: true,
			formatter: FmtNum,
			description: "The number of damage ticks received.",
			partOfScoreID: true,
		},
		bellCount: {
			type: "INTEGER",
			chartDependentMax: true,
			formatter: FmtNum,
			description: "The number of bells collected.",
			partOfScoreID: true,
		},
		totalBellCount: {
			type: "INTEGER",
			chartDependentMax: true,
			formatter: FmtNum,
			description: "The total number of bells.",
		},
		platScore: {
			type: "INTEGER",
			chartDependentMax: true,
			formatter: FmtNum,
			description: "The Platinum Score value. Only exists in MASTER and LUNATIC charts.",
			partOfScoreID: true,
		},
		scoreGraph: {
			type: "NULLABLE_GRAPH",
			validate: p.isBetween(0, 1010000),
			description: "The history of the projected score, queried in one-second intervals.",
		},
		bellGraph: {
			type: "NULLABLE_GRAPH",
			validate: p.isBetween(-10000, 0),
			description:
				"The history of the number of bells missed, queried in one-second intervals.",
		},
		lifeGraph: {
			type: "NULLABLE_GRAPH",
			validate: p.isBetween(0, 100),
			description: "The life gauge history, queried in one-second intervals.",
		},
	},

	scoreRatingAlgs: {
		rating: {
			description:
				"The rating value of this score. This is identical to the system used in game.",
			formatter: ToDecimalPlaces(2),
		},
	},
	sessionRatingAlgs: {
		naiveRating: {
			description: "The average of your best 10 ratings this session.",
			formatter: ToDecimalPlaces(2),
		},
	},
	profileRatingAlgs: {
		naiveRating: {
			description: "The average of your best 45 scores.",
			formatter: ToDecimalPlaces(2),
		},
	},

	defaultScoreRatingAlg: "rating",
	defaultSessionRatingAlg: "naiveRating",
	defaultProfileRatingAlg: "naiveRating",

	difficulties: {
		type: "FIXED",
		order: ["BASIC", "ADVANCED", "EXPERT", "MASTER", "LUNATIC"],
		shorthand: {
			BASIC: "BAS",
			ADVANCED: "ADV",
			EXPERT: "EXP",
			MASTER: "MAS",
			LUNATIC: "LUN",
		},
		default: "MASTER",
	},

	classes: {
		colour: {
			type: "DERIVED",
			values: OngekiColours,
		},
	},

	orderedJudgements: ["cbreak", "break", "hit", "miss"],

	versions: {
		brightMemory2Omni: "bright MEMORY Act.II Omnimix",
		brightMemory3: "bright MEMORY Act.III",
		brightMemory3Omni: "bright MEMORY Act.III Omnimix",
	},

	chartData: z.strictObject({
		displayVersion: z.string(),
		isReMaster: z.boolean().optional(),
		maxPlatScore: z.number().int(),
		inGameID: z.number().int(),
	}),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["songTitle", "tachiSongID", "inGameID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;
