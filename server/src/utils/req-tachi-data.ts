import deepmerge from "deepmerge";
import { SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import type { TachiRequestData } from "./types";
import type { Request } from "express";

export function AssignToReqTachiData(req: Request, data: Partial<TachiRequestData>) {
	if (!req[SYMBOL_TACHI_DATA]) {
		req[SYMBOL_TACHI_DATA] = data;
	} else {
		req[SYMBOL_TACHI_DATA] = deepmerge(req[SYMBOL_TACHI_DATA]!, data);
	}
}

const logger = CreateLogCtx(__filename);

export function GetUGPT(req: Request) {
	if (!req[SYMBOL_TACHI_DATA]) {
		logger.error(`Tried to get UGPT from a req that doesn't have SYMBOL_TachiData.`);
		throw new Error("Failed to get UGPT.");
	}

	const user = req[SYMBOL_TACHI_DATA]!.requestedUser;
	const game = req[SYMBOL_TACHI_DATA]!.game;
	const playtype = req[SYMBOL_TACHI_DATA]!.playtype;

	if (!user || !game || !playtype) {
		logger.error(`Tried to get UGPT from a req that doesnt have U, G and PT.`);
		throw new Error(`Failed to get UGPT.`);
	}

	return { user, game, playtype };
}

export function GetGPT(req: Request) {
	if (!req[SYMBOL_TACHI_DATA]) {
		logger.error(`Tried to get GPT from a req that doesn't have SYMBOL_TachiData.`);
		throw new Error("Failed to get GPT.");
	}

	const game = req[SYMBOL_TACHI_DATA]!.game;
	const playtype = req[SYMBOL_TACHI_DATA]!.playtype;

	if (!game || !playtype) {
		logger.error(`Tried to get GPT from a req that doesnt have a Game and Playtype.`);
		throw new Error(`Failed to get GPT.`);
	}

	return { game, playtype };
}
