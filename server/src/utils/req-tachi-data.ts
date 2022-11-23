import deepmerge from "deepmerge";
import { SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import type { TachiRequestData } from "./types";
import type { Request } from "express";

export function AssignToReqTachiData(req: Request, data: Partial<TachiRequestData>) {
	if (!req[SYMBOL_TACHI_DATA]) {
		req[SYMBOL_TACHI_DATA] = data;
	} else {
		req[SYMBOL_TACHI_DATA] = deepmerge(req[SYMBOL_TACHI_DATA]!, data, {
			// don't merge arrays, replace them with the new array.
			arrayMerge: (a, b) => b,
		});
	}
}

export function GetTachiData<T extends keyof TachiRequestData>(
	req: Request,
	key: T
): Exclude<TachiRequestData[T], undefined> {
	if (!req[SYMBOL_TACHI_DATA]) {
		throw new Error(
			`SYMBOL_TACHI_DATA was not set on a request, yet ${key} was attempted to be retrieved from it?`
		);
	}

	const value = req[SYMBOL_TACHI_DATA]?.[key];

	if (value === undefined) {
		throw new Error(
			`${key} was attempted to be retrieved from SYMBOL_TACHI_DATA, but was not defined.`
		);
	}

	// Safe assertion due to value === undefined check above.
	return value as unknown as Exclude<TachiRequestData[T], undefined>;
}

export function GetUGPT(req: Request) {
	const user = GetTachiData(req, "requestedUser");
	const game = GetTachiData(req, "game");
	const playtype = GetTachiData(req, "playtype");

	return { user, game, playtype };
}

export function GetGPT(req: Request) {
	const game = GetTachiData(req, "game");
	const playtype = GetTachiData(req, "playtype");

	return { game, playtype };
}
