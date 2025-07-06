import { CreateBatchManualClassProvider } from "./class-handler";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { TachiConfig } from "lib/setup/config";
import { p } from "prudence";
import { GetGameConfig, GetGPTString } from "tachi-common";
import { PR_BATCH_MANUAL } from "tachi-common/lib/schemas";
import { IsRecord, IsValidGame, IsValidPlaytype } from "utils/misc";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../types";
import type { BatchManualContext } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { BatchManual, BatchManualScore, Game, ImportTypes, Playtype } from "tachi-common";

/**
 * Parses an object of BATCH-MANUAL data.
 * @param object - The object to parse.
 * @param body - The request body that made this file import request.
 */
export function ParseBatchManualFromObject(
	object: unknown,
	importType: ImportTypes,
	inferTimestamp: boolean,
	_logger: KtLogger
): ParserFunctionReturns<BatchManualScore, BatchManualContext> {
	// now to perform some basic validation so we can return
	// the iterable

	if (!IsRecord(object)) {
		throw new ScoreImportFatalError(
			400,
			`Invalid BATCH-MANUAL (Not an object, received ${
				object === null ? "null" : typeof object
			}.)`
		);
	}

	// attempt to retrieve game
	// @ts-expect-error man.
	const maybeGame = object.meta?.game as unknown;

	// @ts-expect-error man.
	const maybePlaytype = object.meta?.playtype as unknown;

	if (maybeGame === undefined) {
		throw new ScoreImportFatalError(
			400,
			`Could not retrieve meta.game - is this valid BATCH-MANUAL?`
		);
	}

	if (maybePlaytype === undefined) {
		throw new ScoreImportFatalError(
			400,
			`Could not retrieve meta.playtype - is this valid BATCH-MANUAL?`
		);
	}

	// maybeGame could be a number or really anything.
	// So we have to check that it's both a string and a valid game.
	if (!(typeof maybeGame === "string" && IsValidGame(maybeGame))) {
		throw new ScoreImportFatalError(
			400,
			`Invalid game '${maybeGame}' - expected any of ${TachiConfig.GAMES.join(", ")}.`
		);
	}

	const game: Game = maybeGame;

	const gameConfig = GetGameConfig(game);

	if (!(typeof maybePlaytype === "string" && IsValidPlaytype(game, maybePlaytype))) {
		throw new ScoreImportFatalError(
			400,
			`Invalid playtype '${maybePlaytype}' - expected any of ${gameConfig.playtypes.join(
				", "
			)}.`
		);
	}

	const playtype: Playtype = maybePlaytype;

	// now that we have the game, we can validate this against
	// the prudence schema for batch-manual.
	// This mostly works as a sanity check, and doesn't
	// check things like whether a score is > 100%
	// or something.
	const err = p(object, PR_BATCH_MANUAL(game, playtype));

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid BATCH-MANUAL"));
	}

	const batchManual = object as unknown as BatchManual;

	// If this import method wants us to infer the timestamp then we should do that
	// this operation only really makes sense for single-score imports so
	// we'll enforce that.
	if (inferTimestamp) {
		if (batchManual.scores.length > 1) {
			throw new ScoreImportFatalError(
				400,
				`Cannot use X-Infer-Score-TimeAchieved with multiple scores in your import.`
			);
		}

		if (batchManual.scores[0]!.timeAchieved) {
			throw new ScoreImportFatalError(
				400,
				`Cannot use X-Infer-Score-Timestamp if the importing score already has a timeAchieved set.`
			);
		}

		batchManual.scores[0]!.timeAchieved = Date.now();
	}

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
		classProvider: batchManual.classes
			? CreateBatchManualClassProvider(GetGPTString(game, playtype), batchManual.classes)
			: null,
	};
}
