import deepmerge from "deepmerge";
import { Game, Playtypes, GetGameConfig, GetGamePTConfig } from "tachi-common";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import { CONF_INFO } from "../../lib/setup/config";

const LAZY_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export const PRUDENCE_PUBLIC_USER: PrudenceSchema = {
	_id: p.any,
	username: p.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/u),
	usernameLowercase: (self, parent) => self === (parent!.username as string).toLowerCase(),
	id: p.isPositiveInteger,
	socialMedia: {
		discord: "*?string",
		twitter: "*?string",
		github: "*?string",
		steam: "*?string",
		youtube: "*?string",
		twitch: "*?string",
	},
	about: p.isBoundedString(0, 4000),
	customPfp: "boolean",
	customBanner: "boolean",
	clan: p.nullable(p.isBoundedString(1, 4)),
	lastSeen: p.nullable(p.isPositiveInteger),
};

export const PRUDENCE_PRIVATE_USER = Object.assign(
	{
		password: "string", // could be a tighter fit related to bcrypt?
		email: p.regex(LAZY_EMAIL_REGEX),
	},
	PRUDENCE_PUBLIC_USER
);

export const PRUDENCE_IIDX_BPI_DATA = {
	coef: p.nullable(p.isPositiveNonZero),
	kavg: p.isPositiveNonZeroInteger,
	wr: p.isPositiveNonZeroInteger,
	chartID: "string",
	kesd: p.isPositiveNonZero,
};

export const PRUDENCE_COUNTER = {
	counterName: "string",
	value: p.isPositiveNonZeroInteger, // is nonzero?
};

export const PR_SCORE_GENERIC = {
	service: p.isBoundedString(3, 64),
	game: "string",
	playtype: "string",
	difficulty: "string",
	userID: p.isPositiveNonZeroInteger,
	scoreData: {
		score: p.isPositive,
		percent: p.isBetween(0, 100), // could be overrode!
		lamp: "string",
		grade: "string",
		lampIndex: p.isPositiveInteger,
		gradeIndex: p.isPositiveInteger,
		judgements: {},
		hitMeta: {},
	},
	scoreMeta: {},
	calculatedData: {
		rating: p.isPositive,
		lampRating: p.isPositive,
		gameSpecific: {},
		// ranking: p.nullable(p.isPositiveNonZeroInteger),
		// outOf: p.nullable(
		//     p.and(
		//         p.isPositiveNonZeroInteger,
		//         (self, parent: Record<string, unknown>) =>
		//             (parent.ranking as number) <= (self as number)
		//     )
		// ),
	},
	timeAchieved: p.nullable(p.isPositive),
	songID: p.isInteger,
	chartID: (self: unknown) => typeof self === "string" && self.length === 40,
	highlight: "boolean",
	isPrimary: "boolean",
	comment: p.nullable(p.isBoundedString(1, 240)),
	timeAdded: p.isPositive,
	scoreID: "string", // temp
	importType: p.nullable(p.isIn(CONF_INFO.supportedImportTypes)),
};

type ScoreSchemas = {
	[G in Game]: {
		[P in Playtypes[G]]: PrudenceSchema;
	};
};

const optionalPositiveInt = p.optional(p.isPositiveInteger);

const nullableAndOptional = (fn: ValidSchemaValue) => p.optional(p.nullable(fn));

const nullableAndOptionalPosInt = nullableAndOptional(p.isPositiveInteger);

const CreateGameScoreData = (
	game: Game,
	playtype: Playtypes[Game],
	hitMetaMerge: PrudenceSchema
) => {
	const gptConfig = GetGamePTConfig(game, playtype);
	return {
		lamp: p.isIn(gptConfig.lamps),
		lampIndex: p.and(
			p.isPositiveInteger,
			(self, parent) => gptConfig.lamps[self as number] === parent.lamp
		),
		grade: p.isIn(gptConfig.grades),
		gradeIndex: p.and(
			p.isPositiveInteger,
			(self, parent) => gptConfig.grades[self as number] === parent.grade
		),
		judgements: Object.fromEntries(gptConfig.judgements.map((e) => [e, optionalPositiveInt])),
		hitMeta: deepmerge(
			{
				fast: nullableAndOptionalPosInt,
				slow: nullableAndOptionalPosInt,
				maxCombo: nullableAndOptionalPosInt,
			},
			hitMetaMerge
		),
		esd: p.nullable(p.isPositive),
	};
};

const PR_SCORE_IIDX_SP: PrudenceSchema = CreatePRScore(
	"iidx",
	"SP",
	{
		bp: nullableAndOptional(p.isPositiveInteger),
		gauge: nullableAndOptional(p.isBetween(0, 100)),
		gaugeHistory: p.optional([nullableAndOptional(p.isBetween(0, 100))]),
		comboBreak: optionalPositiveInt,
		deadMeasure: nullableAndOptional(p.isPositiveInteger),
		deadNote: nullableAndOptional(p.isPositiveInteger),
	},
	{
		random: nullableAndOptional(p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])),
		gauge: nullableAndOptional(p.isIn(["ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX-HARD"])),
		assist: nullableAndOptional(
			p.isIn(["NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "ASCR + LEGACY"])
		),
		range: nullableAndOptional(
			p.isIn(["NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+"])
		),
		pacemaker: "*?string", // lazy
		pacemakerName: "*?string",
		pacemakerTarget: nullableAndOptional(p.isPositiveInteger),
	},
	{
		BPI: "?number",
		"K%": p.nullable(p.isBetween(0, 100)),
	}
);

const PR_SCORE_BMS_7K: PrudenceSchema = CreatePRScore(
	"bms",
	"7K",
	{
		gauge: nullableAndOptional(p.isBetween(0, 100)),
		bp: nullableAndOptionalPosInt,
		diedAt: nullableAndOptionalPosInt,
		lpr: nullableAndOptionalPosInt,
		lbd: nullableAndOptionalPosInt,
		lgd: nullableAndOptionalPosInt,
		lgr: nullableAndOptionalPosInt,
		lpg: nullableAndOptionalPosInt,
		epr: nullableAndOptionalPosInt,
		ebd: nullableAndOptionalPosInt,
		egd: nullableAndOptionalPosInt,
		egr: nullableAndOptionalPosInt,
		epg: nullableAndOptionalPosInt,
	},
	{
		random: nullableAndOptional(p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])),
		inputDevice: nullableAndOptional(p.isIn(["KEYBOARD", "BM_CONTROLLER", "MIDI"])),
	}
);

function CreatePRScore<G extends Game>(
	game: G,
	playtype: Playtypes[G],
	mergeHitMeta: PrudenceSchema = {},
	mergeScoreMeta: PrudenceSchema = {},
	mergeGameSpecific: PrudenceSchema = {}
) {
	return deepmerge(PR_SCORE_GENERIC, {
		game: p.equalTo(game),
		playtype: p.equalTo(playtype),
		scoreData: CreateGameScoreData(game, playtype, mergeHitMeta),
		scoreMeta: mergeScoreMeta,
		calculatedData: {
			gameSpecific: mergeGameSpecific,
		},
	});
}

function DoublePlayTwinRandomTuple(self: unknown) {
	if (!Array.isArray(self)) {
		return "Expected an array.";
	}

	if (self.length !== 2) {
		return "Expected exactly 2 elements.";
	}

	const ls = p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])(self[0]);

	if (ls !== true) {
		return ls;
	}

	const rs = p.isIn(["NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"])(self[1]);

	return rs;
}

export const PRUDENCE_SCORE_SCHEMAS: ScoreSchemas = {
	iidx: {
		SP: PR_SCORE_IIDX_SP,
		DP: deepmerge(PR_SCORE_IIDX_SP, {
			playtype: p.equalTo("DP"),
			scoreMeta: {
				random: nullableAndOptional(DoublePlayTwinRandomTuple),
			},
			calculatedData: {
				gameSpecific: {
					"K%": "undefined", // remove with override
				},
			},
		}),
	},
	sdvx: {
		Single: CreatePRScore(
			"sdvx",
			"Single",
			{
				gauge: p.optional(p.isBetween(0, 100)),
				btnRate: p.optional(p.isBetween(0, 100)),
				holdRate: p.optional(p.isBetween(0, 100)),
				laserRate: p.optional(p.isBetween(0, 100)),
			},
			{},
			{
				VF4: p.nullable(p.isPositiveInteger),
				VF5: p.nullable(p.isBetween(0, 0.5)), // hack
			}
		),
	},
	bms: {
		"7K": PR_SCORE_BMS_7K,
		"14K": deepmerge(PR_SCORE_BMS_7K, {
			playtype: p.equalTo("14K"),
			scoreMeta: {
				random: p.optional(DoublePlayTwinRandomTuple),
			},
		}),
	},
	chunithm: {
		Single: deepmerge(CreatePRScore("chunithm", "Single"), {
			scoreData: { percent: p.isBetween(0, 101) },
		}),
	},
	ddr: {
		SP: CreatePRScore(
			"ddr",
			"SP",
			{},
			{},
			{
				MFCP: p.nullable(p.isBoundedInteger(1, 25)),
			}
		),
		DP: CreatePRScore(
			"ddr",
			"DP",
			{},
			{},
			{
				MFCP: p.nullable(p.isBoundedInteger(1, 25)),
			}
		),
	},
	gitadora: {
		Gita: CreatePRScore("gitadora", "Gita"),
		Dora: CreatePRScore("gitadora", "Dora"),
	},
	// jubeat: {
	// 	Single: CreatePRScore("jubeat", "Single"),
	// },
	maimai: {
		Single: deepmerge(CreatePRScore("maimai", "Single"), {
			scoreData: { percent: p.isBetween(0, 150) },
		}),
	},
	museca: {
		Single: CreatePRScore("museca", "Single"),
	},
	// popn: {
	// 	"9B": CreatePRScore("popn", "9B", { gauge: p.optional(p.isBetween(0, 100)) }),
	// },
	usc: {
		Single: CreatePRScore("usc", "Single", { gauge: p.optional(p.isBetween(0, 100)) }),
	},
};

const PRUDENCE_CHART_BASE: PrudenceSchema = {
	chartID: "string",
	rgcID: "?string",
	songID: p.isPositiveInteger,
	level: "string",
	levelNum: p.isPositive,
	isPrimary: "boolean",
	versions: ["string"],
};

function CreatePrChart(game: Game, flags: string[], data: PrudenceSchema) {
	const gameConfig = GetGameConfig(game);

	const validDifficulties = [];
	for (const playtype of gameConfig.validPlaytypes) {
		validDifficulties.push(...GetGamePTConfig(game, playtype).difficulties);
	}

	return deepmerge(PRUDENCE_CHART_BASE, {
		difficulty: p.isIn(validDifficulties),
		playtype: p.isIn(gameConfig.validPlaytypes),
		flags: Object.fromEntries(flags.map((e) => [e, "boolean"])),
		data,
	});
}

export const PRUDENCE_CHART_SCHEMAS: Record<Game, PrudenceSchema> = {
	iidx: CreatePrChart("iidx", ["IN BASE GAME", "OMNIMIX", "N-1"], {
		notecount: p.isPositiveInteger,
		inGameID: p.isPositiveInteger,
		arcChartID: "?string",
	}),
	bms: CreatePrChart("bms", [], { hashMD5: "string", hashSHA256: "string" }),
	chunithm: CreatePrChart("chunithm", ["IN BASE GAME", "OMNIMIX"], {
		inGameID: p.isPositiveInteger,
	}),
	ddr: CreatePrChart("ddr", ["IN BASE GAME", "N-1"], {
		songHash: "string",
		inGameID: "string",
	}),
	gitadora: CreatePrChart("gitadora", ["IN BASE GAME", "OMNIMIX", "HOT N-1", "HOT"], {
		inGameID: p.isPositiveInteger,
	}),
	// jubeat: CreatePrChart("jubeat", ["IN BASE GAME"], {}),
	maimai: CreatePrChart("maimai", ["IN BASE GAME"], {
		maxPercent: p.gte(100),
		inGameID: "string",
	}),
	museca: CreatePrChart("museca", ["IN BASE GAME", "OMNIMIX"], {}),
	// popn: CreatePrChart("popn", ["IN BASE GAME", "OMNIMIX"], {}),
	sdvx: CreatePrChart("sdvx", ["IN BASE GAME", "OMNIMIX", "N-1"], {
		inGameID: p.isPositiveInteger,
	}),
	usc: CreatePrChart("usc", ["CUSTOM"], {
		hashSHA256: "string",
	}),
};

const PRUDENCE_SONG_BASE: PrudenceSchema = {
	id: p.isPositiveInteger,
	title: "string",
	artist: "string",
	"search-titles": [p.and("string", (self, parent) => self !== parent.title)],
	"alt-titles": [p.and("string", (self, parent) => self !== parent.title)],
	firstVersion: "string",
};

function CreatePrSong(data: PrudenceSchema) {
	return deepmerge(PRUDENCE_SONG_BASE, {
		data,
	});
}

const PRUDENCE_SONG_WITH_GENRE = CreatePrSong({ genre: "string" });

export const PRUDENCE_SONG_SCHEMAS: Record<Game, PrudenceSchema> = {
	iidx: PRUDENCE_SONG_WITH_GENRE,
	bms: PRUDENCE_SONG_WITH_GENRE,
	chunithm: PRUDENCE_SONG_WITH_GENRE,
	ddr: CreatePrSong({}),
	gitadora: CreatePrSong({}),
	// jubeat: CreatePrSong({}),
	maimai: CreatePrSong({ titleJP: "string", artistJP: "string", genre: "string" }),
	museca: CreatePrSong({ titleJP: "string", artistJP: "string" }),
	// popn: PRUDENCE_SONG_WITH_GENRE,
	sdvx: CreatePrSong({ uscEquiv: p.nullable(p.isPositiveInteger) }),
	usc: CreatePrSong({ sdvxEquiv: p.nullable(p.isPositiveInteger) }),
};

const PRUDENCE_FOLDER_CHART_LOOKUP: PrudenceSchema = {
	chartID: "string",
	folderID: "string",
};

const PRUDENCE_FOLDER: PrudenceSchema = {
	title: "string",
	game: p.isIn(CONF_INFO.supportedGames),
	playtype: (self, parent) => p.isIn(GetGameConfig(parent.game as Game).validPlaytypes)(self),
	folderID: "string",
	table: "string",
	tableIndex: "number",
	type: p.isIn("songs", "charts", "static"),
	data: (self, parent) => {
		if (parent.type === "static") {
			return Array.isArray(self) && self.every((e) => typeof e === "string");
		}

		// this is a temp hackjob, it should technically
		// check whether this document matches a
		// partialised chart/song doc
		// but.. can be done later.
		return typeof self === "object" && !!self; // whatever
	},
};

/**
 * Schemas that are "static", i.e. the content of the document
 * does not depend on fields in the document (such as score docs)
 * being different depending on the score.game field.
 */
export const STATIC_SCHEMAS = {
	users: PRUDENCE_PRIVATE_USER,
	"iidx-bpi-data": PRUDENCE_IIDX_BPI_DATA,
	counters: PRUDENCE_COUNTER,
	charts: PRUDENCE_CHART_SCHEMAS,
	songs: PRUDENCE_SONG_SCHEMAS,
	"folder-chart-lookup": PRUDENCE_FOLDER_CHART_LOOKUP,
	folders: PRUDENCE_FOLDER,
};
