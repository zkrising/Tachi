import { SYMBOL_TachiData } from "lib/constants/tachi";
import { Request } from "express";
import { TachiRequestData } from "./types";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";

export function AssignToReqTachiData(req: Request, data: Partial<TachiRequestData>) {
	if (!req[SYMBOL_TachiData]) {
		req[SYMBOL_TachiData] = data;
	} else {
		req[SYMBOL_TachiData] = deepmerge(req[SYMBOL_TachiData]!, data);
	}
}

const logger = CreateLogCtx(__filename);

export function GetUGPT(req: Request) {
	if (!req[SYMBOL_TachiData]) {
		logger.error(`Tried to get UGPT from a req that doesn't have SYMBOL_TachiData.`);
		throw new Error("Failed to get UGPT.");
	}

	const user = req[SYMBOL_TachiData]!.requestedUser;
	const game = req[SYMBOL_TachiData]!.game;
	const playtype = req[SYMBOL_TachiData]!.playtype;

	if (!user || !game || !playtype) {
		logger.error(`Tried to get UGPT from a req that doesnt have U, G and PT.`);
		throw new Error(`Failed to get UGPT.`);
	}

	return { user, game, playtype };
}

export function GetGPT(req: Request) {
	if (!req[SYMBOL_TachiData]) {
		logger.error(`Tried to get GPT from a req that doesn't have SYMBOL_TachiData.`);
		throw new Error("Failed to get GPT.");
	}

	const game = req[SYMBOL_TachiData]!.game;
	const playtype = req[SYMBOL_TachiData]!.playtype;

	if (!game || !playtype) {
		logger.error(`Tried to get GPT from a req that doesnt have a Game and Playtype.`);
		throw new Error(`Failed to get GPT.`);
	}

	return { game, playtype };
}
