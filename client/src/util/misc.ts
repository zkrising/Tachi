import { Playtype } from "types/tachi";
import { GetGamePTConfig, Game, ScoreCalculatedDataLookup, IDStrings } from "tachi-common";

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
	let str = "";

	const valueStr = v.toFixed();

	for (let i = 0; i < valueStr.length; i++) {
		const backwardsIndex = valueStr.length - i - 1;
		if (i % 3 === 0 && i > 0) {
			str += ",";
		}
		str += valueStr[backwardsIndex];
	}

	return ReverseStr(str);
}
