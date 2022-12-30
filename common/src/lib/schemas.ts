// Schemas for some objects in tachi. These are exported in a record that maps
// their name in the database to the object they schemaify.
// The schemas themselves are wrapped in functions that throw on error.

import { GetGameConfig, GetGamePTConfig } from "../config/old-config";
import { allIDStrings, allImportTypes, allSupportedGames } from "../constants/import-types";
import { ALL_PERMISSIONS } from "../constants/permissions";
import { UserAuthLevels } from "../types";
import deepmerge from "deepmerge";
import { p } from "prudence";
import type { GamePTConfig } from "../config/old-config";
import type { AllClassSets } from "../config/game-classes";
import type { Game, IDStrings, NotificationBody, Playtype, Playtypes } from "../types";
import type {
	PrudenceSchema,
	ValidationFunctionParentOptionsKeychain,
	ValidSchemaValue,
} from "prudence";

export const optNull = (v: ValidSchemaValue): ValidationFunctionParentOptionsKeychain =>
	p.optional(p.nullable(v));

export const optNullFluffStrField = optNull(p.isBoundedString(3, 140));

/**
 * Wrap a prudence schema in a callable function that takes an unknown item and attempts
 * to validate it.
 */
function prSchemaFnWrap(schema: PrudenceSchema) {
	return (s: unknown): true => {
		const err = p(s, schema);

		if (err) {
			throw err;
		}

		return true;
	};
}

export const PR_GAMESPECIFIC_SETTINGS = (game: Game): PrudenceSchema => {
	switch (game) {
		case "iidx":
			return {
				display2DXTra: p.optional("boolean"),
				bpiTarget: p.optional(p.isBoundedInteger(0, 100)),
			};
		case "sdvx":
		case "usc":
			return {
				vf6Target: p.optional(p.isBetween(0, 0.5)),
			};
		case "bms":
			return {
				displayTables: ["string"],
			};
		case "jubeat":
			return {
				// 165.1 is the max jubility.
				jubilityTarget: p.optional(p.isBetween(0, 165.1)),
			};

		default:
			return {};
	}
};

const PR_GAME_STATS = (game: Game, playtype: Playtypes[Game], gptConfig: GamePTConfig) => ({
	userID: p.isPositiveNonZeroInteger,
	game: p.is(game),
	playtype: p.is(playtype),
	ratings: Object.fromEntries(gptConfig.scoreRatingAlgs.map((s) => [s, "*number"])),
	classes: Object.fromEntries(
		Object.keys(gptConfig.classHumanisedFormat).map((e) => [e, p.optional(p.isInteger)])
	),
});

const PR_GOAL_INFO = {
	progress: "?number",
	progressHuman: "string",
	outOf: "number",
	outOfHuman: "string",
	achieved: "boolean",
};

const GetHitMeta = (game: Game): PrudenceSchema => {
	if (game === "iidx") {
		return {
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBetween(0, 100)),
			gaugeHistory: optNull([p.nullable(p.isBetween(0, 100))]),
			comboBreak: optNull(p.isPositiveInteger),
			gsm: optNull({
				EASY: [p.nullable(p.isBetween(0, 100))],
				NORMAL: [p.nullable(p.isBetween(0, 100))],
				HARD: [p.nullable(p.isBetween(0, 100))],
				EX_HARD: [p.nullable(p.isBetween(0, 100))],
			}),
		};
	} else if (game === "bms") {
		return {
			epg: optNull(p.isPositiveInteger),
			egr: optNull(p.isPositiveInteger),
			egd: optNull(p.isPositiveInteger),
			epr: optNull(p.isPositiveInteger),
			ebd: optNull(p.isPositiveInteger),
			lpg: optNull(p.isPositiveInteger),
			lgr: optNull(p.isPositiveInteger),
			lgd: optNull(p.isPositiveInteger),
			lpr: optNull(p.isPositiveInteger),
			lbd: optNull(p.isPositiveInteger),
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBetween(0, 100)),
		};
	} else if (game === "sdvx" || game === "usc") {
		return { gauge: optNull(p.isBetween(0, 100)) };
	}

	return {};
};

const extractGPTIDString = (self: unknown) => {
	if (typeof self !== "object" || !self) {
		throw new Error("Expected an object.");
	}

	const s = self as Record<string, unknown>;

	if (typeof s.idString !== "string") {
		throw new Error(`Expected a string where self.idString is. Got ${s.idString}`);
	}

	// if there's no ":" in the string, this returns only one element.
	const [game, playtype] = s.idString.split(":") as [string, string | undefined];

	if (!IsValidGame(game)) {
		throw new Error(`Expected valid game -- got ${game} from idString ${s.idString}.`);
	}

	// Playtype might be undefined in the case where the string contains no colon.
	if (playtype === undefined || !IsValidPlaytype(game, playtype)) {
		throw new Error(`Expected valid playtype -- got ${playtype} from idString ${s.idString}.`);
	}

	return { game, playtype };
};

const extractGPT = (self: unknown) => {
	if (typeof self !== "object" || !self) {
		throw new Error("Expected an object.");
	}

	const s = self as Record<string, unknown>;

	if (typeof s.game !== "string") {
		throw new Error(`Expected a string where self.game is. Got ${s.game}`);
	}

	if (typeof s.playtype !== "string") {
		throw new Error(`Expected a string where self.playtype is. Got ${s.playtype}`);
	}

	if (!IsValidGame(s.game)) {
		throw new Error(`Expected valid game -- got ${s.game}.`);
	}

	if (!IsValidPlaytype(s.game, s.playtype)) {
		throw new Error(`Expected valid playtype -- got ${s.playtype}.`);
	}

	return { game: s.game, playtype: s.playtype };
};

const PR_RANDOM = p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR");

const GetScoreMeta = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => {
	if (game === "iidx" && playtype === "SP") {
		return {
			random: optNull(PR_RANDOM),
			assist: optNull(p.isIn("NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "FULL ASSIST")),
			range: optNull(p.isIn("NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+")),
			gauge: optNull(p.isIn("ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX-HARD")),
		};
	} else if (game === "iidx" && playtype === "DP") {
		return {
			random: optNull({
				left: PR_RANDOM,
				right: PR_RANDOM,
			}),
			assist: optNull(p.isIn("NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "FULL ASSIST")),
			range: optNull(p.isIn("NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+")),
			gauge: optNull(p.isIn("ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX-HARD")),
		};
	} else if (game === "sdvx") {
		return { inSkillAnalyser: "*?boolean" };
	} else if (game === "usc") {
		return {
			noteMod: optNull(p.isIn("NORMAL", "MIRROR", "RANDOM", "MIR-RAN")),
			gaugeMod: optNull(p.isIn("NORMAL", "HARD", "PERMISSIVE")),
		};
	} else if (game === "bms" && playtype === "7K") {
		return {
			random: optNull(PR_RANDOM),
			inputDevice: optNull(p.isIn("KEYBOARD", "BM_CONTROLLER")),
			client: optNull(p.isIn("LR2", "lr2oraja")),
		};
	} else if (game === "bms" && playtype === "14K") {
		return {
			random: optNull({
				left: PR_RANDOM,
				right: PR_RANDOM,
			}),
			inputDevice: optNull(p.isIn("KEYBOARD", "BM_CONTROLLER")),
			client: optNull(p.isIn("LR2", "lr2oraja")),
		};
	}

	return {};
};

function IsValidPlaytype(game: Game, str: string): str is Playtypes[Game] {
	return GetGameConfig(game).validPlaytypes.includes(str as Playtypes[Game]);
}

function IsValidGame(str: string): str is Game {
	return allSupportedGames.includes(str as Game);
}

const getPlaytype = (game: Game, self: unknown): Playtypes[Game] => {
	if (self === null || typeof self !== "object") {
		throw new Error("Expected an object.");
	}

	const gameConfig = GetGameConfig(game);

	const s = self as Record<string, unknown>;

	const playtype = s.playtype as string;

	if (!IsValidPlaytype(game, playtype)) {
		throw new Error(`Expected any of ${gameConfig.validPlaytypes.join(", ")}`);
	}

	return playtype;
};

const games = allSupportedGames;

const isValidPlaytype = (self: unknown, parent: Record<string, unknown>) => {
	if (typeof parent.game !== "string" || !IsValidGame(parent.game)) {
		throw new Error(`Invalid Schema, need game to base IsValidPlaytype off of.`);
	}

	if (typeof self !== "string") {
		return "Expected a string.";
	}

	if (!IsValidPlaytype(parent.game, self)) {
		return `Expected a valid playtype for ${parent.game}`;
	}

	return true;
};

function GetSongDataForGame(game: Game): PrudenceSchema {
	switch (game) {
		case "bms":
			return {
				genre: "?string",
				subtitle: "?string",
				subartist: "?string",
				tableString: "?string",
			};
		case "chunithm":
			return {
				genre: "string",
				displayVersion: "string",
			};
		case "sdvx":
			return {
				displayVersion: "string",
			};
		case "maimaidx":
			return {
				displayVersion: "string",
			};
		case "museca":
			return {
				titleJP: "string",
				artistJP: "string",
				displayVersion: "string",
			};
		case "iidx":
			return {
				genre: "string",
				displayVersion: "string",
			};
		case "wacca":
			return {
				genre: "string",
				displayVersion: "?string",
				titleJP: "string",
				artistJP: "string",
			};
		case "pms":
			return {
				genre: "?string",
				subtitle: "?string",
				subartist: "?string",
				tableString: "?string",
			};
		case "popn":
			return {
				genre: "string",
				genreEN: "?string",
				displayVersion: "?string",
			};
		case "jubeat":
			return {
				displayVersion: "string",
			};
		case "itg":
			return {
				subtitle: "string",
				banner: "?string",
			};
		case "gitadora":
			return {
				isHot: "boolean",
			};
		case "usc":
			return {};
	}
}

function GetChartDataForGPT(idString: IDStrings): PrudenceSchema {
	switch (idString) {
		case "bms:7K":
		case "bms:14K":
			return {
				notecount: p.isPositiveNonZeroInteger,
				hashSHA256: "?string",
				hashMD5: "?string",
				aiLevel: "*?string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			};
		case "jubeat:Single":
			return {
				inGameID: p.or(p.isPositiveInteger, [p.isPositiveInteger]),
				isHardMode: "boolean",
			};
		case "chunithm:Single":
			return {
				inGameID: p.isPositiveInteger,
			};
		case "iidx:SP":
		case "iidx:DP":
			return {
				notecount: p.isPositiveNonZeroInteger,
				inGameID: p.or(p.isPositiveNonZeroInteger, [p.isPositiveNonZeroInteger]),
				hashSHA256: "?string",
				"2dxtraSet": "?string",
				kaidenAverage: "?number",
				worldRecord: "?number",
				bpiCoefficient: "?number",
			};
		case "maimaidx:Single":
			return {
				isLatest: "boolean",
			};
		case "museca:Single":
			return {
				inGameID: p.isPositiveInteger,
			};
		case "sdvx:Single":
			return {
				inGameID: p.isPositiveInteger,
			};
		case "usc:Controller":
		case "usc:Keyboard":
			return {
				hashSHA1: p.or("string", ["string"]),
				isOfficial: "boolean",
				effector: "string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			};
		case "wacca:Single":
			return {
				isHot: "boolean",
			};
		case "pms:Controller":
		case "pms:Keyboard":
			return {
				notecount: p.isPositiveNonZeroInteger,
				hashSHA256: "?string",
				hashMD5: "?string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			};
		case "popn:9B":
			return {
				hashSHA256: p.or("?string", ["string"]),
				inGameID: p.isPositiveInteger,
			};
		case "itg:Stamina":
			return {
				chartHash: "string",
				breakdown: {
					detailed: "string",
					partiallySimplified: "string",
					simplified: "string",
					total: "string",
					npsPerMeasure: [p.isPositive],
					notesPerMeasure: [p.isPositive],
				},
				tech: {
					crossovers: p.isPositiveInteger,
					jacks: p.isPositiveInteger,
					brackets: p.isPositiveInteger,
					footswitches: p.isPositiveInteger,
					sideswitches: p.isPositiveInteger,
				},
				length: p.isPositive,
				charter: "string",
				displayBPM: p.isPositive,

				// todo, maybe constrain this a bit?
				difficultyTag: "string",
			};
		case "gitadora:Dora":
		case "gitadora:Gita":
			return {
				inGameID: p.isPositiveInteger,
			};
	}
}

export const PR_GOAL_SCHEMA = {
	game: p.isIn(games),
	playtype: isValidPlaytype,
	name: "string",
	goalID: "string",
	criteria: p.or(
		{
			mode: p.is("single"),
			key: p.isIn(
				"scoreData.percent",
				"scoreData.lampIndex",
				"scoreData.gradeIndex",
				"scoreData.score"
			),
			value: "number",
		},
		{
			mode: p.isIn("absolute", "proportion"),
			countNum: p.isPositive,
			key: p.isIn(
				"scoreData.percent",
				"scoreData.lampIndex",
				"scoreData.gradeIndex",
				"scoreData.score"
			),
			value: "number",
		}
	),
	charts: p.or(
		{
			type: p.is("folder"),
			data: "string",
		},
		{
			type: p.is("multi"),
			data: ["string"],
		},
		{
			type: p.is("single"),
			data: "string",
		}
	),
};

const PR_SONG_DOCUMENT = (game: Game): PrudenceSchema => {
	const data = GetSongDataForGame(game);

	return {
		id: p.isPositiveInteger,
		title: "string",
		artist: "string",
		searchTerms: ["string"],
		altTitles: ["string"],
		data,
	};
};

const PR_CHART_DOCUMENT = (game: Game) => (self: unknown) => {
	const playtype = getPlaytype(game, self);

	const gptConfig = GetGamePTConfig(game, playtype);

	const data = GetChartDataForGPT(`${game}:${playtype}` as IDStrings);

	return prSchemaFnWrap({
		songID: p.isPositiveInteger,
		chartID: "string",
		rgcID: "?string",
		level: "string",
		levelNum: "number",
		isPrimary: "boolean",

		// temp hack
		difficulty: game === "itg" ? "string" : p.isIn(gptConfig.difficulties),
		playtype: p.is(playtype),
		data,
		tierlistInfo: Object.fromEntries(
			gptConfig.tierlists.map((t) => [
				t,
				p.optional({ text: "string", value: "number", individualDifference: "*boolean" }),
			])
		),
		versions: [p.isIn(gptConfig.orderedSupportedVersions)],
	})(self);
};

const PR_CHALLENGE = {
	chartID: "string",
	authorID: p.isPositiveNonZeroInteger,
	type: p.isIn("lamp", "score"),

	game: p.isIn(games),
	playtype: isValidPlaytype,
};

// Returns true on success, throws on failure.
export type SchemaValidatorFunction = (self: unknown) => true;

type GameSchemas = Record<`${"charts" | "songs"}-${Game}`, SchemaValidatorFunction>;

function CreateGameSchemas() {
	const obj: Partial<GameSchemas> = {};

	for (const game of games) {
		obj[`songs-${game}`] = prSchemaFnWrap(PR_SONG_DOCUMENT(game));
		obj[`charts-${game}`] = PR_CHART_DOCUMENT(game);
	}

	// guaranteed to no longer be partial
	return obj as GameSchemas;
}

const GAME_SCHEMAS = CreateGameSchemas();

// OK, here's an insane hack.
// We want schemas to be a a record of key -> SchemaValidatorFunction, but it can't
// be naively done with Record<string, SchemaValidatorFunction>, because that results
// in you losing the actual hardcoded keys in the map.

// The alternative? Declare it const and redeclare it with those keys on export!
// This is typesafe to including garbage in PRE_SCHEMAS, although with a slightly more
// obtuse error message.
const PRE_SCHEMAS = {
	"bms-course-lookup": prSchemaFnWrap({
		title: "string",

		// Must be comprised of 4 md5 hashes, which are 32 chars long.
		md5sums: (self) => {
			if (typeof self !== "string") {
				return "Expected a string";
			}

			if (self.length !== 32 * 4) {
				return "Expected 32 * 4 characters (4 md5 hashes long).";
			}

			if (!/^[a-z0-9]*$/u.exec(self)) {
				return "Expected all chars to be in the range of a-z0-9.";
			}

			return true;
		},
		set: p.isIn("genocideDan", "stslDan", "lnDan", "scratchDan"),
		playtype: p.isIn("7K", "14K"),
		value: p.isInteger,
	}),
	folders: prSchemaFnWrap({
		title: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		folderID: "string",
		inactive: "boolean",
		searchTerms: ["string"],
		type: p.isIn("songs", "charts", "static"),
		data: (self, parent) => {
			if (parent.type === "songs") {
				return true; // temp. should be a song.
			} else if (parent.type === "charts") {
				return true; // temp. should be a chart.
			}

			return (
				(Array.isArray(self) && self.every((r) => typeof r === "string")) ||
				"Expected an array of only strings."
			);
		},
	}),
	tables: prSchemaFnWrap({
		tableID: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		title: "string",
		default: "boolean",
		description: "string",
		folders: ["string"],
		inactive: "boolean",
	}),
	...GAME_SCHEMAS,
	questlines: prSchemaFnWrap({
		questlineID: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		quests: ["string"],
		name: "string",
		desc: "string",
	}),
	quests: prSchemaFnWrap({
		game: p.isIn(games),
		playtype: isValidPlaytype,
		name: "string",
		desc: "string",
		questID: "string",
		questData: [
			{
				title: "string",
				desc: "*string",
				goals: [{ goalID: "string", note: "*string" }],
			},
		],
	}),
	"goal-subs": prSchemaFnWrap({
		goalID: "string",
		userID: p.isPositiveNonZeroInteger,
		game: p.isIn(games),
		playtype: isValidPlaytype,
		achieved: "boolean",
		timeAchieved: p.nullable(p.isPositive),
		lastInteraction: p.nullable(p.isPositive),
		progress: "?number",
		progressHuman: "string",
		outOf: "number",
		outOfHuman: "string",
	}),
	"quest-subs": prSchemaFnWrap({
		questID: "string",
		userID: p.isPositiveNonZeroInteger,
		game: p.isIn(games),
		playtype: isValidPlaytype,
		achieved: "boolean",
		timeAchieved: p.nullable(p.isPositive),
		progress: p.isInteger,
	}),
	"recent-folder-views": prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		game: p.isIn(games),
		playtype: isValidPlaytype,
		folderID: "string",
		lastViewed: "number",
	}),
	goals: prSchemaFnWrap(PR_GOAL_SCHEMA),
	scores: (self: unknown) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		const hitMeta = {
			fast: optNull(p.isPositiveInteger),
			slow: optNull(p.isPositiveInteger),
			maxCombo: optNull(p.isPositiveInteger),
			...GetHitMeta(game),
		};

		const scoreMeta = GetScoreMeta(game, playtype);

		return prSchemaFnWrap({
			service: "string",
			game: p.is(game),
			playtype: p.is(playtype),
			userID: p.isPositiveNonZeroInteger,
			songID: p.isPositiveInteger,
			chartID: "string",
			isPrimary: "boolean",
			highlight: "boolean",
			comment: "?string",
			timeAdded: p.isInteger,
			scoreID: "string",
			importType: p.nullable(p.isIn(allImportTypes)),
			timeAchieved: p.nullable(p.isPositive),
			scoreData: {
				score: "number",
				lamp: p.isIn(gptConfig.lamps),
				lampIndex: p.isIn(Object.keys(gptConfig.lamps).map(Number)),
				grade: p.isIn(gptConfig.grades),
				gradeIndex: p.isIn(Object.keys(gptConfig.grades).map(Number)),
				percent: p.isBetween(0, gptConfig.percentMax),
				esd: "?number",
				judgements: Object.fromEntries(
					gptConfig.judgements.map((j) => [j, optNull(p.isInteger)])
				),
				hitMeta,
			},
			scoreMeta,
			calculatedData: Object.fromEntries(
				gptConfig.scoreRatingAlgs.map((a) => [a, "*?number"])
			),
		})(self);
	},
	"personal-bests": (self: unknown) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		const hitMeta = {
			fast: optNull(p.isPositiveInteger),
			slow: optNull(p.isPositiveInteger),
			maxCombo: optNull(p.isPositiveInteger),
			...GetHitMeta(game),
		};

		return prSchemaFnWrap({
			composedFrom: {
				scorePB: "string",
				lampPB: "string",
				other: p.optional([{ name: "string", scoreID: "string" }]),
			},
			rankingData: {
				rank: p.isPositiveNonZeroInteger,
				outOf: p.isPositiveNonZeroInteger,
			},
			userID: p.isPositiveNonZeroInteger,
			chartID: "string",
			game: p.is(game),
			playtype: p.is(playtype),
			songID: p.isPositiveNonZeroInteger,
			highlight: "boolean",
			isPrimary: "boolean",
			timeAchieved: p.nullable(p.isPositive),
			scoreData: {
				score: "number",
				lamp: p.isIn(gptConfig.lamps),
				lampIndex: p.isIn(Object.keys(gptConfig.lamps).map(Number)),
				grade: p.isIn(gptConfig.grades),
				gradeIndex: p.isIn(Object.keys(gptConfig.grades).map(Number)),
				percent: p.isBetween(0, gptConfig.percentMax),
				esd: "?number",
				judgements: Object.fromEntries(
					gptConfig.judgements.map((j) => [j, optNull(p.isInteger)])
				),
				hitMeta,
			},
			calculatedData: Object.fromEntries(
				gptConfig.scoreRatingAlgs.map((a) => [a, "*?number"])
			),
		})(self);
	},
	"user-settings": prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		preferences: {
			invisible: "boolean",
			developerMode: "boolean",
			advancedMode: "boolean",
			contentiousContent: "boolean",
			deletableScores: "boolean",
		},
	}),
	sessions: (self: unknown) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaFnWrap({
			userID: p.isPositiveNonZeroInteger,
			sessionID: "string",
			name: "string",
			desc: "?string",
			game: p.is(game),
			playtype: isValidPlaytype,
			importType: p.nullable(p.isIn(allImportTypes)),
			timeInserted: p.isPositiveInteger,
			timeEnded: p.isPositiveInteger,
			timeStarted: p.isPositiveInteger,
			highlight: "boolean",
			calculatedData: Object.fromEntries(
				gptConfig.sessionRatingAlgs.map((k) => [k, "*?number"])
			),
			scoreIDs: ["string"],
		})(self);
	},
	imports: prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		timeStarted: p.isPositive,
		timeFinished: p.isPositive,
		idStrings: [p.isIn(allIDStrings)],
		importID: "string",
		scoreIDs: ["string"],
		game: p.isIn(games),

		// @ts-expect-error We've asserted this is definitely a game.
		playtypes: [(self) => p.isIn(GetGameConfig(self.game).validPlaytypes)(self)],
		errors: [
			{
				type: "string",
				message: "?string",
			},
		],
		createdSessions: [
			{
				sessionID: "string",
				type: p.isIn("Created", "Appended"),
			},
		],
		importType: p.nullable(p.isIn(allImportTypes)),
		classDeltas: [
			{
				game: p.isIn(games),
				playtype: isValidPlaytype,
				set: "string", // Technically false, but the validation is a pain.
				old: p.nullable(p.isInteger),
				new: p.isInteger,
			},
		],
		goalInfo: [
			{
				goalID: "string",
				old: PR_GOAL_INFO,
				new: PR_GOAL_INFO,
			},
		],
		questInfo: [
			{
				questID: "string",
				old: { progress: p.isInteger, achieved: "boolean" },
				new: { progress: p.isInteger, achieved: "boolean" },
			},
		],
		userIntent: "boolean",
	}),
	counters: prSchemaFnWrap({
		counterName: "string",
		value: p.isPositiveInteger,
	}),
	"score-blacklist": prSchemaFnWrap({
		scoreID: "string",
		userID: p.isPositiveNonZeroInteger,
		score: p.any,
	}),
	"game-stats": (self: unknown) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaFnWrap(PR_GAME_STATS(game, playtype, gptConfig))(self);
	},
	"game-stats-snapshots": (self: unknown) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaFnWrap(
			Object.assign(PR_GAME_STATS(game, playtype, gptConfig), {
				rankings: Object.fromEntries(
					gptConfig.profileRatingAlgs.map((e) => [
						e,
						{ outOf: p.isPositiveNonZeroInteger, ranking: p.isPositiveNonZeroInteger },
					])
				),
				playcount: p.isPositiveInteger,
				timestamp: p.isPositive,
			})
		)(self);
	},
	"game-settings": (s: unknown) => {
		const { game, playtype } = extractGPT(s);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaFnWrap({
			userID: p.isPositiveNonZeroInteger,
			game: p.is(game),
			playtype: p.is(playtype),
			preferences: {
				preferredScoreAlg: p.nullable(p.isIn(gptConfig.scoreRatingAlgs)),
				preferredSessionAlg: p.nullable(p.isIn(gptConfig.sessionRatingAlgs)),
				preferredProfileAlg: p.nullable(p.isIn(gptConfig.profileRatingAlgs)),

				// ouch
				stats: p.and(
					[
						p.or(
							{
								mode: p.is("chart"),
								chartID: "string",
								property: p.isIn("score", "percent", "grade", "lamp", "playcount"),
							},
							{
								mode: p.is("folder"),
								folderID: p.or("string", ["string"]),
								property: p.isIn("score", "percent", "grade", "lamp"),
								gte: p.isPositive,
							}
						),
					],
					(self) => Array.isArray(self) && self.length <= 6
				),
				scoreBucket: p.isIn(null, "grade", "lamp"),

				gameSpecific: PR_GAMESPECIFIC_SETTINGS(game),
			},
		})(s);
	},
	"folder-chart-lookup": prSchemaFnWrap({
		chartID: "string",
		folderID: "string",
	}),
	"class-achievements": prSchemaFnWrap({
		game: p.isIn(games),
		playtype: isValidPlaytype,
		classSet: (self, parent) => {
			const gptConfig = GetGamePTConfig(
				parent.game as Game,
				parent.playtype as Playtypes[Game]
			);

			const keys = Object.keys(gptConfig.classHumanisedFormat);

			if (typeof self !== "string") {
				return "Expected a string.";
			}

			if (!keys.includes(self)) {
				return `Expected any of ${keys.join(", ")}`;
			}

			return true;
		},
		classOldValue: p.nullable(p.isInteger),
		classValue: p.isInteger,
		timeAchieved: p.isPositive,
		userID: p.isPositiveNonZeroInteger,
	}),
	"fer-settings": prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		cards: p.nullable(
			(self) =>
				Array.isArray(self) && self.length <= 6 && self.every((t) => typeof t === "string")
		),
		forceStaticImport: "boolean",
	}),
	"kshook-sv6c-settings": prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		forceStaticImport: "boolean",
	}),
	users: prSchemaFnWrap({
		username: p.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/u),
		usernameLowercase: (self, parent) => self === (parent.username as string).toLowerCase(),
		id: p.isPositiveInteger,
		socialMedia: {
			discord: "*?string",
			twitter: "*?string",
			github: "*?string",
			steam: "*?string",
			youtube: "*?string",
			twitch: "*?string",
		},
		joinDate: p.isPositiveInteger,
		about: p.isBoundedString(0, 2000),
		status: p.nullable(p.isBoundedString(3, 140)),
		customPfpLocation: "?string",
		customBannerLocation: "?string",
		clan: p.nullable(p.isBoundedString(2, 4)),
		lastSeen: p.isPositiveInteger,
		badges: [p.isIn("beta", "alpha", "devTeam")],
		authLevel: p.isBoundedInteger(UserAuthLevels.BANNED, UserAuthLevels.ADMIN),
	}),
	"api-tokens": prSchemaFnWrap({
		userID: p.nullable(p.isPositiveNonZeroInteger),
		token: "?string",
		identifier: "string",
		permissions: (self) => {
			if (typeof self !== "object" || !self) {
				return `Invalid permissions - expected an object.`;
			}

			// Typescript moment...
			const s = self as Record<string, unknown>;

			for (const key of Object.keys(ALL_PERMISSIONS)) {
				if (s[key] !== undefined && typeof s[key] !== "boolean") {
					return `Invalid permission value of ${s[key]} at ${key}.`;
				}
			}

			return true;
		},
		fromOAuth2Client: "*string",
	}),
	"user-private-information": prSchemaFnWrap({
		userID: p.isPositiveNonZeroInteger,
		password: "string",
		email: "string",
	}),
	"orphan-chart-queue": (self: unknown) => {
		const { game } = extractGPTIDString(self);

		return prSchemaFnWrap({
			idString: p.isIn(allIDStrings),
			chartDoc: PR_CHART_DOCUMENT(game),
			songDoc: PR_SONG_DOCUMENT(game),
			userIDs: [p.isPositiveNonZeroInteger],
		})(self);
	},
	"api-clients": prSchemaFnWrap({
		clientID: "string",
		clientSecret: "string",
		name: "string",
		author: p.isPositiveNonZeroInteger,
		requestedPermissions: [p.isIn(Object.keys(ALL_PERMISSIONS))],
		redirectUri: "?string",
		webhookUri: "?string",
		apiKeyTemplate: p.nullable((self) => {
			if (typeof self !== "string") {
				return "Expected a string.";
			}

			if (!self.includes("%%TACHI_KEY%%")) {
				return "Template must include %%TACHI_KEY%%.";
			}

			return true;
		}),
		apiKeyFilename: "?string",
	}),
	"import-timings": prSchemaFnWrap({
		importID: "string",
		timestamp: p.isPositive,
		total: p.isPositive,
		rel: Object.fromEntries(
			["import", "importParse", "session", "pb"].map((k) => [k, p.isPositive])
		),
		abs: Object.fromEntries(
			["parse", "import", "importParse", "session", "pb", "ugs", "goal", "quest"].map((k) => [
				k,
				p.isPositive,
			])
		),
	}),
	invites: prSchemaFnWrap({
		createdBy: p.isPositiveInteger,
		code: "string",
		createdAt: p.isPositive,
		consumed: "boolean",
		consumedBy: (self, parent) => {
			if (parent.consumed === true) {
				return self === null;
			}

			return p.isPositiveInteger(self);
		},
		consumedAt: (self, parent) => {
			if (parent.consumed === true) {
				return self === null;
			}

			return p.isPositive(self);
		},
	}),

	"challenge-wall": prSchemaFnWrap(PR_CHALLENGE),
	"challenge-subs": prSchemaFnWrap({
		...PR_CHALLENGE,
		userID: p.isPositiveNonZeroInteger,
		achieved: "boolean",
		achievedAt: "?number",
	}),

	notifications: prSchemaFnWrap({
		title: "string",
		notifID: "string",
		sentTo: p.isPositiveNonZeroInteger,
		sentAt: p.isPositive,
		read: "boolean",
		body: {
			type: p.isIn("RIVALED_BY", "QUEST_CHANGED"),
			content: (self, parent) => {
				const type = parent.type as NotificationBody["type"];

				let subSchema = {};

				switch (type) {
					case "RIVALED_BY": {
						subSchema = {
							userID: p.isPositiveNonZeroInteger,
							game: p.isIn(games),
							playtype: isValidPlaytype,
						};
						break;
					}

					case "QUEST_CHANGED": {
						subSchema = {
							questID: "string",
						};
						break;
					}

					case "SITE_ANNOUNCEMENT": {
						subSchema = {};
						break;
					}
				}

				const err = p(self, subSchema);

				if (err) {
					return "Invalid notification.body";
				}

				return true;
			},
		},
	}),
} as const;

export const SCHEMAS: Record<keyof typeof PRE_SCHEMAS, SchemaValidatorFunction> = PRE_SCHEMAS;

const BaseValidHitMeta = {
	fast: optNull(p.isPositiveInteger),
	slow: optNull(p.isPositiveInteger),
	maxCombo: optNull(p.isPositiveInteger),
};

const PR_DP_RANDOM = (self: unknown) => {
	if (!Array.isArray(self) || self.length !== 2) {
		return "Expected an array with length 2";
	}

	for (const a of self) {
		if (p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR")(a) !== true) {
			return false;
		}
	}

	return true;
};

const PR_SCORE_META = (game: Game, playtype: Playtype): PrudenceSchema => {
	if (game === "iidx") {
		const random =
			playtype === "SP"
				? optNull(p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"))
				: PR_DP_RANDOM;

		return {
			random,
			assist: optNull(p.isIn("NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "FULL ASSIST")),
			range: optNull(p.isIn("NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+")),
			gauge: optNull(p.isIn("ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX HARD")),
		};
	} else if (game === "bms") {
		const random =
			playtype === "7K"
				? optNull(p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"))
				: optNull(PR_DP_RANDOM);

		return {
			random,
			inputDevice: optNull(p.isIn("KEYBOARD", "BM_CONTROLLER")),
			client: optNull(p.isIn("LR2", "lr2oraja")),
		};
	} else if (game === "usc") {
		return {
			noteMod: optNull(p.isIn("NORMAL", "MIRROR", "RANDOM", "MIR-RAN")),
			gaugeMod: optNull(p.isIn("NORMAL", "HARD", "PERMISSIVE")),
		};
	} else if (game === "sdvx") {
		return {
			inSkillAnalyser: "*?boolean",
		};
	} else if (game === "wacca") {
		return { mirror: "*?boolean" };
	} else if (game === "popn") {
		return {
			hiSpeed: optNull(p.isPositive),
			hidden: optNull(p.isInteger),
			sudden: optNull(p.isInteger),
			random: optNull(p.isIn("NONRAN", "MIRROR", "RANDOM", "S-RANDOM")),
			gauge: optNull(p.isIn("NORMAL", "EASY", "HARD", "DANGER")),
		};
	}

	return {};
};

const PR_HIT_META = (game: Game): PrudenceSchema => {
	if (game === "iidx") {
		return {
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBetween(0, 100)),
			gaugeHistory: optNull([p.isBetween(0, 100)]),
			scoreHistory: optNull([p.isPositiveInteger]),
			comboBreak: optNull(p.isPositiveInteger),
			gsm: optNull({
				EASY: [p.nullable(p.isBetween(0, 100))],
				NORMAL: [p.nullable(p.isBetween(0, 100))],
				HARD: [p.nullable(p.isBetween(0, 100))],
				EX_HARD: [p.nullable(p.isBetween(0, 100))],
			}),
		};
	} else if (game === "sdvx") {
		return {
			gauge: optNull(p.isBetween(0, 100)),
		};
	} else if (game === "usc") {
		return { gauge: optNull(p.isBetween(0, 1)) };
	} else if (game === "bms") {
		return {
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBetween(0, 100)),
			lbd: optNull(p.isPositiveInteger),
			ebd: optNull(p.isPositiveInteger),
			lpr: optNull(p.isPositiveInteger),
			epr: optNull(p.isPositiveInteger),
			lgd: optNull(p.isPositiveInteger),
			egd: optNull(p.isPositiveInteger),
			lgr: optNull(p.isPositiveInteger),
			egr: optNull(p.isPositiveInteger),
			lpg: optNull(p.isPositiveInteger),
			epg: optNull(p.isPositiveInteger),
		};
	} else if (game === "popn") {
		return {
			gauge: optNull(p.isBetween(0, 100)),
			specificClearType: optNull(
				p.isIn(
					"failedUnknown",
					"failedCircle",
					"failedDiamond",
					"failedStar",
					"easyClear",
					"clearCircle",
					"clearDiamond",
					"clearStar",
					"fullComboCircle",
					"fullComboDiamond",
					"fullComboStar",
					"perfect"
				)
			),
		};
	}

	return {};
};

const PR_BATCH_MANUAL_SCORE = (game: Game, playtype: Playtype): PrudenceSchema => {
	const gptConfig = GetGamePTConfig(game, playtype);

	let scoreChecker: ValidSchemaValue = p.isPositiveInteger;

	// DISGUSTING TEMPORARY HACK. NEEDS REFACTOR
	if (game === "itg" || game === "gitadora") {
		scoreChecker = p.isBetween(0, 100);
	} else if (game === "maimaidx") {
		scoreChecker = p.isBetween(0, 101);
	}

	return {
		score: scoreChecker,
		lamp: p.isIn(gptConfig.lamps),
		matchType: p.isIn(
			"songTitle",
			"tachiSongID",
			"bmsChartHash",
			"itgChartHash",
			"sdvxInGameID",
			"inGameID",
			"uscChartHash",
			"popnChartHash"
		),
		identifier: "string",
		percent: game === "jubeat" ? p.isBetween(0, 120) : p.is(undefined),
		comment: optNull(p.isBoundedString(3, 240)),
		difficulty: "*?string",

		// this is checked in converting instead
		// the lowest acceptable time is september 9th 2001 - this check saves people who dont
		// read any documentation and would otherwise submit garbage.
		timeAchieved: optNull(
			(self) =>
				(typeof self === "number" && self > 1_000_000_000_000) ||
				self === 0 ||
				"Expected a number greater than 1 Trillion - did you pass unix seconds instead of milliseconds?"
		),
		judgements: optNull((self) => {
			if (typeof self !== "object" || self === null) {
				return "Not a valid object.";
			}

			for (const [key, v] of Object.entries(self)) {
				// @ts-expect-error Frustrating check as it's a string but not a judgement so it's not really
				// happy with it.
				if (!gptConfig.judgements.includes(key)) {
					return `Invalid Key ${key}. Expected any of ${gptConfig.judgements.join(", ")}`;
				}

				if ((!Number.isSafeInteger(v) || v < 0) && v !== null) {
					return `Key ${key} had an invalid value of ${v} [type: ${typeof v}]`;
				}
			}

			return true;
		}),
		hitMeta: optNull(
			deepmerge(BaseValidHitMeta, PR_HIT_META(game)) as unknown as ValidSchemaValue
		),
		scoreMeta: optNull(PR_SCORE_META(game, playtype)),
	};
};

const PR_BATCH_MANUAL_CLASSES = (game: Game, playtype: Playtype): PrudenceSchema => {
	const config = GetGamePTConfig(game, playtype);

	const schema: PrudenceSchema = {};

	// for all classes this GPT supports
	// if `canBeBatchManualSubmitted` is true, allow it to be batchManualSubmitted.
	for (const [s, v] of Object.entries(config.classHumanisedFormat)) {
		const set = s as AllClassSets;

		const classProperties = config.classProperties[set];

		if (classProperties.canBeBatchManualSubmitted) {
			schema[set] = optNull(p.isIn(v.map((e) => e.id)));
		}
	}

	return schema;
};

export const PR_BATCH_MANUAL = (game: Game, playtype: Playtype): PrudenceSchema => ({
	meta: {
		service: p.isBoundedString(3, 60),
		game: p.isIn(allSupportedGames),
		playtype: p.is(playtype),
		version: "*?string",
	},
	scores: [PR_BATCH_MANUAL_SCORE(game, playtype)],
	classes: optNull(PR_BATCH_MANUAL_CLASSES(game, playtype)),
});
