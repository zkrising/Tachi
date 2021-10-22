import {
	Game,
	GetGamePTConfig,
	Playtypes,
	UserAuthLevels,
	GamePTConfig,
	GetGameConfig,
} from "tachi-common";
import { allIDStrings, allImportTypes } from "tachi-common/js/config/static-config";
import p, { PrudenceSchema } from "prudence";
import { Databases } from "./db";
import { AllPermissions } from "server/middleware/auth";
import { ServerTypeInfo } from "lib/setup/config";
import { IsValidGame, IsValidPlaytype } from "utils/misc";
import { optNull } from "utils/prudence";

// The idea of this file is to export a function for every database
// that will validate that collection.

// If it returns true, that document is valid. If it throws any sort
// of error, it is invalid.

function prSchemaify(schema: PrudenceSchema) {
	return (s: unknown): true => {
		const err = p(s, schema);

		if (err) {
			throw err;
		}

		return true;
	};
}

const games = ServerTypeInfo.supportedGames;
const isValidPlaytype = (self: unknown, parent: Record<string, unknown>) => {
	if (!parent.game || typeof parent.game !== "string" || !IsValidGame(parent.game)) {
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

export type ValidatorFunction = (s: unknown) => true;

const PR_GameStats = (game: Game, playtype: Playtypes[Game], gptConfig: GamePTConfig) => ({
	userID: p.isPositiveNonZeroInteger,
	game: p.is(game),
	playtype: p.is(playtype),
	ratings: Object.fromEntries(gptConfig.scoreRatingAlgs.map((s) => [s, "*number"])),
	classes: Object.fromEntries(
		Object.keys(gptConfig.classHumanisedFormat).map((e) => [e, p.optional(p.isInteger)])
	),
});

const PR_GoalInfo = {
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

const PR_Random = p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR");

const getPlaytype = (game: Game, self: unknown): Playtypes[Game] => {
	if (!self || typeof self !== "object") {
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

const PR_SongDocument = (data: PrudenceSchema): PrudenceSchema => ({
	id: p.isPositiveNonZeroInteger,
	title: "string",
	artist: "string",
	firstVersion: "?string",
	searchTerms: ["string"],
	altTitles: ["string"],
	data,
});

const PR_ChartDocument = (
	game: Game,
	playtype: Playtypes[Game],
	data: PrudenceSchema
): PrudenceSchema => {
	const gptConfig = GetGamePTConfig(game, playtype);

	return {
		songID: p.isPositiveNonZeroInteger,
		chartID: "string",
		rgcID: "?string",
		level: "string",
		levelNum: "number",
		isPrimary: "boolean",
		difficulty: p.isIn(gptConfig.difficulties),
		playtype: p.is(playtype),
		data,
		tierlistInfo: Object.fromEntries(
			gptConfig.tierlists.map((t) => [
				t,
				p.optional({ text: "string", value: "number", individualDifference: "*boolean" }),
			])
		),
		versions: [p.isIn(gptConfig.supportedVersions)],
	};
};

const GetScoreMeta = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => {
	if (game === "iidx" && playtype === "SP") {
		return {
			random: optNull(PR_Random),
			assist: optNull(p.isIn("NO ASSIST", "AUTO SCRATCH", "LEGACY NOTE", "FULL ASSIST")),
			range: optNull(p.isIn("NONE", "SUDDEN+", "HIDDEN+", "SUD+ HID+", "LIFT", "LIFT SUD+")),
			gauge: optNull(p.isIn("ASSISTED EASY", "EASY", "NORMAL", "HARD", "EX-HARD")),
		};
	} else if (game === "iidx" && playtype === "DP") {
		return {
			random: optNull({
				left: PR_Random,
				right: PR_Random,
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
			gaugeMod: optNull(p.isIn("NORMAL", "HARD")),
		};
	} else if (game === "bms" && playtype === "7K") {
		return {
			random: optNull(PR_Random),
			inputDevice: optNull(p.isIn("KEYBOARD", "BM_CONTROLLER")),
			client: optNull(p.isIn("LR2", "lr2oraja")),
		};
	} else if (game === "bms" && playtype === "14K") {
		return {
			random: optNull({
				left: PR_Random,
				right: PR_Random,
			}),
			inputDevice: optNull(p.isIn("KEYBOARD", "BM_CONTROLLER")),
			client: optNull(p.isIn("LR2", "lr2oraja")),
		};
	}

	return {};
};

export const DatabaseSchemas: Record<Databases, ValidatorFunction> = {
	users: prSchemaify({
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
		about: p.isBoundedString(0, 4000),
		status: p.isBoundedString(3, 140),
		customPfp: "boolean",
		customBanner: "boolean",
		clan: p.nullable(p.isBoundedString(2, 4)),
		lastSeen: p.isPositiveInteger,
		badges: [p.isIn("beta", "alpha", "devTeam")],
		authLevel: p.isBoundedInteger(UserAuthLevels.BANNED, UserAuthLevels.ADMIN),
	}),
	"api-tokens": prSchemaify({
		userID: p.nullable(p.isPositiveNonZeroInteger),
		token: "?string",
		identifier: "string",
		permissions: (self) => {
			if (typeof self !== "object" || !self) {
				return `Invalid permissions - expected an object.`;
			}

			// Typescript moment...
			const s = self as Record<string, unknown>;

			for (const key in AllPermissions) {
				if (s[key] !== undefined || typeof s[key] !== "boolean") {
					return `Invalid permission value of ${s[key]} at ${key}.`;
				}
			}

			return true;
		},
		fromOAuth2Client: "*string",
	}),
	"arc-saved-profiles": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		accountID: "string",
		forImportType: p.isIn("api/arc-iidx", "api/arc-sdvx"),
	}),
	"bms-course-lookup": prSchemaify({
		title: "string",
		// Must be comprised of 4 md5 hashes, which are 32 chars long.
		md5sums: (self) => {
			if (typeof self !== "string") {
				return "Expected a string";
			}

			if (self.length !== 32 * 4) {
				return "Expected 32 * 4 characters (4 md5 hashes long).";
			}

			if (!self.match(/^[a-z0-9]*$/u)) {
				return "Expected all chars to be in the range of a-z0-9.";
			}

			return true;
		},
		set: p.isIn("genocideDan", "stslDan"),
		playtype: p.isIn("7K", "14K"),
		value: p.isInteger,
	}),
	"class-achievements": prSchemaify({
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
	"fer-settings": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		cards: p.nullable(
			(self) =>
				Array.isArray(self) && self.length <= 6 && self.every((t) => typeof t === "string")
		),
		forceStaticImport: "boolean",
	}),
	"folder-chart-lookup": prSchemaify({
		chartID: "string",
		folderID: "string",
	}),
	"game-settings": (s) => {
		const { game, playtype } = extractGPT(s);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaify({
			userID: p.isPositiveNonZeroInteger,
			game: p.is(game),
			playtype: p.is(playtype),
			preferences: {
				preferredScoreAlg: p.nullable(p.isIn(gptConfig.scoreRatingAlgs)),
				preferredSessionAlg: p.nullable(p.isIn(gptConfig.sessionRatingAlgs)),
				preferredProfileAlgs: p.nullable(p.isIn(gptConfig.profileRatingAlgs)),
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
				gameSpecific:
					game === "iidx"
						? {
								display2DXTra: "boolean",
						  }
						: {},
			},
		})(s);
	},
	"game-stats": (self) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaify(PR_GameStats(game, playtype, gptConfig))(self);
	},
	"game-stats-snapshots": (self) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaify(
			Object.assign(PR_GameStats(game, playtype, gptConfig), {
				ranking: p.isPositiveNonZeroInteger,
				playcount: p.isPositiveInteger,
				timestamp: p.isPositive,
			})
		)(self);
	},
	"import-locks": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
	}),
	"import-timings": prSchemaify({
		importID: "string",
		timestamp: p.isPositive,
		total: p.isPositive,
		rel: Object.fromEntries(
			["import", "importParse", "session", "pb"].map((k) => [k, p.isPositive])
		),
		abs: Object.fromEntries(
			["parse", "import", "importParse", "session", "pb", "ugs", "goal", "milestone"].map(
				(k) => [k, p.isPositive]
			)
		),
	}),
	"kai-auth-tokens": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		token: "string",
		refreshToken: "string",
		service: p.isIn("FLO", "EAG", "MIN"),
	}),
	"oauth2-auth-codes": prSchemaify({
		code: "string",
		userID: p.isPositiveNonZeroInteger,
		createdOn: p.isPositive,
	}),
	"oauth2-clients": prSchemaify({
		clientID: "string",
		clientSecret: "string",
		name: "string",
		author: p.isPositiveNonZeroInteger,
		requestedPermissions: [p.isIn(Object.keys(AllPermissions))],
		redirectUri: "string",
		webhookUri: "?string",
	}),
	"orphan-chart-queue": prSchemaify({
		idString: p.isIn(allIDStrings),
		// @todo #370 Properly prudence-def orphan-chart-queue.
		chartDoc: p.any,
		songDoc: p.any,
		userIDs: [p.isPositiveNonZeroInteger],
	}),
	"password-reset-codes": prSchemaify({
		code: "string",
		userID: p.isPositiveNonZeroInteger,
		createdOn: p.isPositive,
	}),
	"score-blacklist": prSchemaify({
		scoreID: "string",
		userID: p.isPositiveNonZeroInteger,
		score: p.any,
	}),
	"session-view-cache": prSchemaify({
		sessionID: "string",
		ip: "string",
		timestamp: p.isPositive,
	}),
	"user-private-information": prSchemaify({
		userInfo: p.isPositiveNonZeroInteger,
		password: "string",
		email: "string",
	}),
	"verify-email-codes": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		code: "string",
		email: "string",
	}),
	counters: prSchemaify({
		counterName: "string",
		value: p.isPositiveInteger,
	}),
	folders: prSchemaify({
		title: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		folderID: "string",
		inactive: "boolean",
		searchTerms: ["string"],
	}),
	tables: prSchemaify({
		tableID: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		title: "string",
		description: "string",
		folders: ["string"],
		inactive: "boolean",
	}),
	"user-settings": prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		preferences: {
			invisible: "boolean",
			developerMode: "boolean",
			contentiousContent: "boolean",
		},
	}),
	sessions: (self) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		return prSchemaify({
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
			views: p.isInteger,
			calculatedData: Object.fromEntries(
				gptConfig.sessionRatingAlgs.map((k) => [k, "*?number"])
			),
			scoreInfo: [
				p.or(
					{
						scoreID: "string",
						isNewScore: p.is(true),
					},
					{
						scoreID: "string",
						isNewScore: p.is(false),
						scoreDelta: "number",
						gradeDelta: p.isInteger,
						lampDelta: p.isInteger,
						percentDelta: "number",
					}
				),
			],
		})(self);
	},
	imports: prSchemaify({
		userID: p.isPositiveNonZeroInteger,
		timeStarted: p.isPositive,
		timeFinished: p.isPositive,
		idStrings: [p.isIn(allIDStrings)],
		importID: "string",
		scoreIDs: ["string"],
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
				old: PR_GoalInfo,
				new: PR_GoalInfo,
			},
		],
		milestoneInfo: [
			{
				milestoneID: "string",
				old: { progress: p.isInteger, achieved: "boolean" },
				new: { progress: p.isInteger, achieved: "boolean" },
			},
		],
		userIntent: "boolean",
	}),
	scores: (self) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		const hitMeta = Object.assign(
			{
				fast: optNull(p.isPositiveInteger),
				slow: optNull(p.isPositiveInteger),
				maxCombo: optNull(p.isPositiveInteger),
			},
			GetHitMeta(game)
		);

		const scoreMeta = GetScoreMeta(game, playtype);

		return prSchemaify({
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
	"personal-bests": (self) => {
		const { game, playtype } = extractGPT(self);

		const gptConfig = GetGamePTConfig(game, playtype);

		const hitMeta = Object.assign(
			{
				fast: optNull(p.isPositiveInteger),
				slow: optNull(p.isPositiveInteger),
				maxCombo: optNull(p.isPositiveInteger),
			},
			GetHitMeta(game)
		);

		return prSchemaify({
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
	"songs-bms": prSchemaify(
		PR_SongDocument({
			genre: "?string",
			subtitle: "?string",
			subartist: "?string",
		})
	),
	"songs-chunithm": prSchemaify(
		PR_SongDocument({
			genre: "string",
		})
	),
	"songs-ddr": prSchemaify(PR_SongDocument({})),
	"songs-sdvx": prSchemaify(PR_SongDocument({})),
	"songs-usc": prSchemaify(PR_SongDocument({})),
	"songs-maimai": prSchemaify(
		PR_SongDocument({
			titleJP: "string",
			artistJP: "string",
			genre: "string",
		})
	),
	"songs-museca": prSchemaify(
		PR_SongDocument({
			titleJP: "string",
			artistJP: "string",
		})
	),
	"songs-gitadora": prSchemaify({
		isHot: "boolean",
	}),
	"songs-iidx": prSchemaify({
		genre: "string",
	}),
	"charts-iidx": (self) => {
		const playtype = getPlaytype("iidx", self);

		return prSchemaify(
			PR_ChartDocument("iidx", playtype, {
				notecount: p.isPositiveNonZeroInteger,
				inGameID: p.isPositiveNonZeroInteger,
				arcChartID: "?string",
				hashSHA256: "?string",
				"2dxtraSet": "?string",
			})
		)(self);
	},
	"charts-bms": (self) => {
		const playtype = getPlaytype("bms", self);

		return prSchemaify(
			PR_ChartDocument("bms", playtype, {
				notecount: p.isPositiveNonZeroInteger,
				hashSHA256: "?string",
				hashMD5: "?string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			})
		)(self);
	},
	"charts-chunithm": prSchemaify(
		PR_ChartDocument("chunithm", "Single", {
			inGameID: p.isPositiveInteger,
		})
	),
	"charts-gitadora": (self) => {
		const playtype = getPlaytype("gitadora", self);

		return prSchemaify(
			PR_ChartDocument("gitadora", playtype, {
				inGameID: p.isPositiveInteger,
			})
		)(self);
	},
	"charts-ddr": (self) => {
		const playtype = getPlaytype("ddr", self);

		return prSchemaify(
			PR_ChartDocument("ddr", playtype, {
				inGameID: "string",
				songHash: "string",
			})
		)(self);
	},
	"charts-maimai": prSchemaify(
		PR_ChartDocument("maimai", "Single", {
			maxPercent: p.gt(0),
			inGameID: p.isPositiveInteger,
			inGameStrID: "string",
		})
	),
	"charts-museca": prSchemaify(
		PR_ChartDocument("museca", "Single", {
			inGameID: p.isPositiveInteger,
		})
	),
	"charts-sdvx": prSchemaify(
		PR_ChartDocument("sdvx", "Single", {
			inGameID: p.isPositiveInteger,
			arcChartID: "string",
		})
	),
	"charts-usc": prSchemaify(
		PR_ChartDocument("usc", "Single", {
			hashSHA1: p.or("string", ["string"]),
			isOfficial: "boolean",
		})
	),
	goals: prSchemaify({
		game: p.isIn(games),
		playtype: isValidPlaytype,
		timeAdded: p.isPositive,
		createdBy: p.isPositiveNonZeroInteger,
		title: "string",
		goalID: "string",
		criteria: p.or(
			{
				mode: "single",
				key: p.isIn(
					"scoreData.percent",
					"scoreData.lampIndex",
					"scoreData.gradeIndex",
					"scoreData.score"
				),
				value: "number",
			},
			{
				mode: p.isIn("abs", "proportion"),
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
				type: "any",
			},
			{
				type: "folder",
				data: "string",
			},
			{
				type: "multi",
				data: ["string"],
			},
			{
				type: "single",
				data: "string",
			}
		),
	}),
	milestones: prSchemaify({
		game: p.isIn(games),
		playtype: isValidPlaytype,
		createdBy: p.isPositiveNonZeroInteger,
		name: "string",
		desc: "string",
		milestoneID: "string",
		group: "?string",
		groupINdex: p.nullable(p.isInteger),
		milestoneData: [
			{
				title: "string",
				desc: "string",
				goals: [{ goalID: "string", note: "*string" }],
			},
		],
		criteria: p.or(
			{
				type: "all",
			},
			{
				type: p.isIn("abs", "proportion"),
				value: p.isPositive,
			}
		),
	}),
	"user-goals": prSchemaify({
		goalID: "string",
		userID: p.isPositiveNonZeroInteger,
		game: p.isIn(games),
		playtype: isValidPlaytype,
		achieved: "boolean",
		timeSet: p.isPositive,
		timeAchieved: p.nullable(p.isPositive),
		lastInteraction: p.nullable(p.isPositive),
		progress: "?number",
		progressHuman: "string",
		outOf: "number",
		outOfHuman: "string",
	}),
	"user-milestones": prSchemaify({
		milestoneID: "string",
		userID: p.isPositiveNonZeroInteger,
		game: p.isIn(games),
		playtype: isValidPlaytype,
		timeSet: p.isPositive,
		achieved: "boolean",
		timeAchieved: p.nullable(p.isPositive),
		progress: p.isInteger,
	}),
};
