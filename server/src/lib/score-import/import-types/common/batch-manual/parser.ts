import { KtLogger } from "lib/logger/logger";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { BatchManual, BatchManualContext, BatchManualScore } from "./types";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import { Game, ImportTypes, GetGamePTConfig, Playtypes, GetGameConfig } from "tachi-common";
import deepmerge from "deepmerge";
import { FormatPrError } from "utils/prudence";
import { ParserFunctionReturns } from "../types";
import { ServerTypeInfo } from "lib/setup/config";

const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));

const BaseValidHitMeta = {
	fast: optNull(p.isPositiveInteger),
	slow: optNull(p.isPositiveInteger),
	maxCombo: optNull(p.isPositiveInteger),
};

const PR_HitMeta = (game: Game): PrudenceSchema => {
	if (game === "iidx") {
		return {
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBoundedInteger(0, 100)),
			gaugeHistory: optNull([p.isBoundedInteger(0, 100)]),
			comboBreak: optNull(p.isPositiveInteger),
		};
	} else if (/* game === "popn" || */ game === "sdvx" || game === "usc") {
		return {
			gauge: optNull(p.isBoundedInteger(0, 100)),
		};
	} else if (game === "bms") {
		return {
			bp: optNull(p.isPositiveInteger),
			gauge: optNull(p.isBoundedInteger(0, 100)),
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
			diedAt: optNull(p.isPositiveInteger),
		};
	}

	return {};
};

const PR_BatchManualScore = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => {
	const gptConfig = GetGamePTConfig(game, playtype);
	return {
		score: "number",
		lamp: p.isIn(gptConfig.lamps),
		matchType: p.isIn("songTitle", "ddrSongHash", "tachiSongID", "bmsChartHash"),
		identifier: "string",
		comment: optNull(p.isBoundedString(3, 240)),
		difficulty: "*?string", // this is checked in converting instead
		// september 9th 2001 - this saves people not
		// reading the documentation.
		timeAchieved: optNull(
			(self) =>
				(typeof self === "number" && self > 1_000_000_000_000) ||
				"Expected a number greater than 1 Trillion - did you pass unix seconds instead of miliseconds?"
		),
		judgements: optNull((self) => {
			if (typeof self !== "object" || self === null) {
				return "Not a valid object.";
			}

			for (const key in self) {
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
		// scoreMeta: @todo #74
		// more game specific props, maybe?
	};
};

const PR_BatchManual = (game: Game, playtype: Playtypes[Game]): PrudenceSchema => ({
	meta: {
		service: p.isBoundedString(3, 15),
		game: p.isIn(ServerTypeInfo.supportedGames),
		playtype: p.is(playtype),
		version: "*?string",
	},
	scores: [PR_BatchManualScore(game, playtype)],
});

/**
 * Parses an object of BATCH-MANUAL data.
 * @param object - The object to parse.
 * @param body - The request body that made this file import request.
 */
export function ParseBatchManualFromObject(
	object: unknown,
	importType: ImportTypes,
	logger: KtLogger
): ParserFunctionReturns<BatchManualScore, BatchManualContext> {
	// now to perform some basic validation so we can return
	// the iterable

	if (typeof object !== "object" || object === null) {
		throw new ScoreImportFatalError(
			400,
			`Invalid BATCH-MANUAL (Not an object, recieved ${
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

	if (!ServerTypeInfo.supportedGames.includes(possiblyGame)) {
		throw new ScoreImportFatalError(
			400,
			`Invalid game ${possiblyGame} - expected any of ${ServerTypeInfo.supportedGames.join(
				", "
			)}.`
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
		classHandler: null,
	};
}
