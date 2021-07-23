import crypto from "crypto";
import { CONF_INFO } from "../lib/setup/config";
import { Game, Playtypes, GetGameConfig, AnySongDocument, AnyChartDocument } from "tachi-common";

// https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
// the developer of this has migrated everything to Force ES6 style modules,
// which really really messes with a lot of the ecosystem.
// shim.

export function EscapeStringRegexp(string: string) {
	if (typeof string !== "string") {
		throw new TypeError("Expected a string");
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it's always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns' stricter grammar.
	return string.replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&").replace(/-/gu, "\\x2d");
}

/**
 * Takes a process.hrtime.bigint(), and returns the miliseconds elapsed since it.
 * This function will not work if more than 100(ish) days have passed since the first reference.
 */
export function GetMilisecondsSince(ref: bigint) {
	return Number(process.hrtime.bigint() - ref) / 1e6;
}

export function Random20Hex() {
	return crypto.randomBytes(20).toString("hex");
}

export function MStoS(ms: number) {
	return Math.floor(ms / 1000);
}

/**
 * Random From Array - Selects a random value from an array.
 */
export function RFA(arr: unknown[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Splits an Authorization header into the token and the type.
 */
export function SplitAuthorizationHeader(authHeader: string) {
	const parts = authHeader.split(" ");

	return { type: parts[0], token: parts.slice(1).join(" ") };
}

/**
 * Utility Type Predicate.
 * Determines whether a key is an ownProperty on an object.
 *
 * @returns True if the object contains that key, and changes the type of
 * key to keyof T.
 * False if the object doesn't.
 */
export function HasOwnProperty<T>(obj: T, key: string | number | symbol): key is keyof T {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

export function IsValidGame(str: string): str is Game {
	return !!CONF_INFO.supportedGames.includes(str as Game);
}

export function IsValidPlaytype(game: Game, str: string): str is Playtypes[Game] {
	return GetGameConfig(game).validPlaytypes.includes(str as Playtypes[Game]);
}

export function IsString(val: unknown): val is string {
	return typeof val === "string";
}

export function DedupeArr<T>(arr: T[]): T[] {
	return [...new Set(arr)];
}
