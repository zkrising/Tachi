import { Playtype } from "types/tachi";
import { GetGamePTConfig, Game, ScoreCalculatedDataLookup, IDStrings, integer } from "tachi-common";

export function RFA<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export const NO_OP = () => void 0;

export const PREVENT_DEFAULT: React.FormEventHandler<HTMLFormElement> = e => e.preventDefault();

export function UppercaseFirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

export function IsNullish(value: unknown) {
	return value === null || value === undefined;
}

export function IsNotNullish(value: unknown) {
	return !IsNullish(value);
}

export function PartialArrayRecordAssign<K extends string | number | symbol, T>(
	record: Partial<Record<K, T[]>>,
	key: K,
	data: T
) {
	if (record[key]) {
		record[key]!.push(data);
	} else {
		record[key] = [data];
	}
}

export function FormatBMSTables(bmsTables: { table: string; level: string }[]) {
	return bmsTables.map(e => `${e.table}${e.level}`).join(", ");
}

export function FormatGPTRating(
	game: Game,
	playtype: Playtype,
	key: ScoreCalculatedDataLookup[IDStrings],
	value: number
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (gptConfig.scoreRatingAlgFormatters[key]) {
		return gptConfig.scoreRatingAlgFormatters[key]!(value);
	}

	return value.toFixed(2);
}

export function ReverseStr(str: string) {
	return str
		.split("")
		.reverse()
		.join("");
}

export function FormatMillions(v: number) {
	return v.toLocaleString();
}

export function DelayedPageReload(delay = 300) {
	setTimeout(() => window.location.reload(), delay);
}

export function ShortDelayify(fn: () => void, delay = 300) {
	setTimeout(fn, delay);
}

export const FetchJSONBody = (json: unknown) => ({
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify(json),
});

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

export function Reverse<T>(arr: T[]): T[] {
	return arr.slice(0).reverse();
}

export function PercentFrom(num: number, denom: number) {
	return `${((100 * num) / denom).toFixed(2)}%`;
}

export function StepFromToMax(max: integer, step: integer = 50) {
	const arr = [];

	for (let i = 0; i < max; i += step) {
		if (max - i < 5) {
			// skip adding things like 500 -> 505(max) as it looks bad.
			break;
		}
		arr.push(i);
	}

	arr.push(max);
	return arr;
}
