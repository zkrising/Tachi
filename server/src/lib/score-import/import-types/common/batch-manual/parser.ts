import deepmerge from "deepmerge";
import { KtLogger } from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import {
	BatchManual,
	BatchManualScore,
	Game,
	GetGameConfig,
	GetGamePTConfig,
	ImportTypes,
	Playtypes,
} from "tachi-common";
import { FormatPrError } from "utils/prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParserFunctionReturns } from "../types";
import { CreateBatchManualClassHandler } from "./class-handler";
import { BatchManualContext } from "./types";

const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));

const BaseValidHitMeta = {
	fast: optNull(p.isPositiveInteger),
	slow: optNull(p.isPositiveInteger),
	maxCombo: optNull(p.isPositiveInteger),
};

const PR_DPRandom = (self: unknown) => {
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

const PR_ScoreMeta = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => {
	if (game === "iidx") {
		const random =
			playtype === "SP"
				? optNull(p.isIn("NONRAN", "RANDOM", "R-RANDOM", "S-RANDOM", "MIRROR"))
				: PR_DPRandom;

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
				: optNull(PR_DPRandom);

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

const PR_HitMeta = (game: Game): PrudenceSchema => {
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

const PR_BatchManualScore = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => {
	const gptConfig = GetGamePTConfig(game, playtype);
	return {
		score: p.isPositiveInteger,
		lamp: p.isIn(gptConfig.lamps),
		matchType: p.isIn(
			"songTitle",
			"ddrSongHash",
			"tachiSongID",
			"bmsChartHash",
			"inGameID",
			"uscChartHash",
			"popnChartHash"
		),
		identifier: "string",
		percent: game === "jubeat" ? p.isBetween(0, 120) : p.is(undefined),
		comment: optNull(p.isBoundedString(3, 240)),
		difficulty: "*?string", // this is checked in converting instead
		// september 9th 2001 - this saves people who dont
		// read any documentation.
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

			for (const key in self) {
				// @ts-expect-error check
				if (!gptConfig.judgements.includes(key)) {
					return `Invalid Key ${key}. Expected any of ${gptConfig.judgements.join(", ")}`;
				}

				// @ts-expect-error shush
				const v = self[key];
				if ((!Number.isSafeInteger(v) || v < 0) && v !== null) {
					return `Key ${key} had an invalid value of ${v} [${typeof v}]`;
				}
			}

			return true;
		}),
		hitMeta: optNull(
			deepmerge(BaseValidHitMeta, PR_HitMeta(game)) as unknown as ValidSchemaValue
		),
		scoreMeta: optNull(PR_ScoreMeta(game, playtype)),
	};
};

// both iidx sp and dp share dans.
const IIDXStringDans = GetGamePTConfig("iidx", "SP").classHumanisedFormat.dan.map((e) => e.id);
const SDVXStringDans = GetGamePTConfig("sdvx", "Single").classHumanisedFormat.dan.map((e) => e.id);
const WaccaStringStageUps = GetGamePTConfig("wacca", "Single").classHumanisedFormat.stageUp.map(
	(e) => e.id
);

const PR_BatchManualClasses = (game: Game): PrudenceSchema => {
	switch (game) {
		// This can be implemented for any non-static class (i.e. dans).
		case "iidx":
			return {
				dan: optNull(p.isIn(IIDXStringDans)),
			};
		case "sdvx":
			return {
				dan: optNull(p.isIn(SDVXStringDans)),
			};
		case "wacca":
			return {
				stageUp: optNull(p.isIn(WaccaStringStageUps)),
			};
		default:
			return {};
	}
};

const PR_BatchManual = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => ({
	meta: {
		service: p.isBoundedString(3, 15),
		game: p.isIn(TachiConfig.GAMES),
		playtype: p.is(playtype),
		version: "*?string",
	},
	scores: [PR_BatchManualScore(game, playtype)],
	classes: optNull(PR_BatchManualClasses(game)),
});

/**
 * Parses an object of BATCH-MANUAL data.
 * @param object - The object to parse.
 * @param body - The request body that made this file import request.
 */
export function ParseBatchManualFromObject(
	object: unknown,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	importType: ImportTypes,
	logger: KtLogger
): ParserFunctionReturns<BatchManualScore, BatchManualContext> {
	// now to perform some basic validation so we can return
	// the iterable

	if (typeof object !== "object" || object === null) {
		throw new ScoreImportFatalError(
			400,
			`Invalid BATCH-MANUAL (Not an object, received ${
				object === null ? "null" : typeof object
			}.)`
		);
	}

	// attempt to retrieve game
	// @ts-expect-error man.
	const possiblyGame = object?.meta?.game;
	// @ts-expect-error man.
	const possiblyPlaytype = object?.meta?.playtype;

	if (!possiblyGame) {
		throw new ScoreImportFatalError(
			400,
			`Could not retrieve meta.game - is this valid BATCH-MANUAL?`
		);
	}

	if (!possiblyPlaytype) {
		throw new ScoreImportFatalError(
			400,
			`Could not retrieve meta.playtype - is this valid BATCH-MANUAL?`
		);
	}

	if (!TachiConfig.GAMES.includes(possiblyGame)) {
		throw new ScoreImportFatalError(
			400,
			`Invalid game ${possiblyGame} - expected any of ${TachiConfig.GAMES.join(", ")}.`
		);
	}

	const game: Game = possiblyGame;

	const gameConfig = GetGameConfig(game);

	if (!gameConfig.validPlaytypes.includes(possiblyPlaytype)) {
		throw new ScoreImportFatalError(
			400,
			`Invalid playtype ${possiblyPlaytype} - expected any of ${gameConfig.validPlaytypes.join(
				", "
			)}.`
		);
	}

	const playtype: Playtypes[Game] = possiblyPlaytype;

	// now that we have the game, we can validate this against
	// the prudence schema for batch-manual.
	// This mostly works as a sanity check, and doesn't
	// check things like whether a score is > 100%
	// or something.
	const err = p(object, PR_BatchManual(game, playtype));

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid BATCH-MANUAL"));
	}

	const batchManual = object as BatchManual;

	return {
		game,
		context: {
			service: batchManual.meta.service,
			game,
			playtype,
			version: batchManual.meta.version ?? null,
		},
		iterable: batchManual.scores,
		// if classes are provided, use those as a class handler. Otherwise, we
		// don't care.
		classHandler: batchManual.classes
			? CreateBatchManualClassHandler(batchManual.classes!)
			: null,
	};
}
