import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import {
	APIPermissions,
	ChartDocument,
	Game,
	GamePTConfig,
	GetGamePTConfig,
	Grades,
	IDStrings,
	integer,
	ScoreCalculatedDataLookup,
	ScoreDocument,
	SessionDocument,
} from "tachi-common";
import { Playtype } from "types/tachi";

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

export function FormatTables(tables: { table: string; level: string }[]) {
	return tables.map(e => `${e.table}${e.level}`).join(", ");
}

export function FormatGPTRating(
	game: Game,
	playtype: Playtype,
	key: ScoreCalculatedDataLookup[IDStrings],
	value: number | null
) {
	if (value === null) {
		return "No Data.";
	}

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

export function ComposeExpFn(pow: number) {
	return (x: number) => Math.pow(x, pow);
}

export function ComposeInverseExpFn(pow: number) {
	return (x: number) => Math.pow(x, 1 / pow);
}

export function ComposeLogFn(base: number) {
	return (x: number) => Math.log(x) / Math.log(base);
}

export function SelectRightChart(
	gptConfig: GamePTConfig,
	chartID: string,
	charts: ChartDocument[]
) {
	if (gptConfig.difficulties.includes(chartID as any)) {
		for (const chart of charts) {
			if (chart.difficulty === chartID && chart.isPrimary) {
				return chart;
			}
		}
	} else {
		// else, its a chart ID.
		for (const chart of charts) {
			if (chartID === chart.chartID) {
				return chart;
			}
		}
	}

	return null;
}

export function CopyToClipboard(data: unknown) {
	toast.success("Copied data to clipboard.");

	const str = typeof data === "string" ? data : JSON.stringify(data, null, "\t");

	navigator.clipboard.writeText(str);
}

export const allPermissions: APIPermissions[] = [
	"customise_profile",
	"customise_score",
	"customise_session",
	"delete_score",
	"submit_score",
];

export function WrapError<T>(fn: () => T, errMsg: string) {
	try {
		return fn();
	} catch (err) {
		throw new Error(errMsg);
	}
}

export function Sleep(ms: number) {
	return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

export function HistorySafeGoBack(history: ReturnType<typeof useHistory>) {
	// if (history.length === 1) {
	history.replace("/");
	// } else {
	// history.goBack();
	// }
}
export function ToPercent(n1: number, n2: number) {
	return `${((100 * n1) / n2).toFixed(2)}%`;
}

export function CountElements<T>(data: T[], collector: (element: T) => string | null) {
	const counts: Record<string, number> = {};

	for (const element of data) {
		const key = collector(element);

		if (key === null) {
			continue;
		}

		if (!counts[key]) {
			counts[key] = 1;
		} else {
			counts[key]++;
		}
	}

	return counts;
}

export function FormatScoreRating(
	game: Game,
	playtype: Playtype,
	rating: keyof ScoreDocument["calculatedData"],
	value: number | null | undefined
) {
	if (value === null || value === undefined) {
		return "No Data.";
	}

	const formatter = GetGamePTConfig(game, playtype).scoreRatingAlgFormatters[rating];

	if (!formatter) {
		return value.toFixed(2);
	}

	return formatter(value);
}

export function FormatSessionRating(
	game: Game,
	playtype: Playtype,
	rating: keyof SessionDocument["calculatedData"],
	value: number | null | undefined
) {
	if (value === null || value === undefined) {
		return "No Data.";
	}

	const formatter = GetGamePTConfig(game, playtype).sessionRatingAlgFormatters[rating];

	if (!formatter) {
		return value.toFixed(2);
	}

	return formatter(value);
}

export function GetGradeFromPercent<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype,
	percent: number
): Grades[I] {
	const gptConfig = GetGamePTConfig(game, playtype);
	const boundaries = gptConfig.gradeBoundaries;
	const grades = gptConfig.grades;

	if (!boundaries) {
		throw new Error(
			`Invalid call to GetGradeFromPercent! GPT ${game}:${playtype} does not use grade boundaries.`
		);
	}

	// (hey, this for loop is backwards!)
	for (let i = boundaries.length; i >= 0; i--) {
		if (percent >= boundaries[i]) {
			return grades[i] as Grades[I];
		}
	}

	throw new Error(`Could not resolve grade for percent ${percent} on game ${game}`);
}

export function ConditionalLeadingSpace(maybeStr: string | null) {
	if (maybeStr === null) {
		return "";
	}

	return ` ${maybeStr}`;
}

export function DistinctArr<T>(arr: T[]): T[] {
	return [...new Set(arr)];
}

export function TruncateString(string: string, len = 30) {
	if (string.length < len) {
		return string;
	}

	return `${string.substring(0, len - 3)}...`;
}
