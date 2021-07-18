import { ZTableSearchFn } from "components/util/table/useZTable";
import { SEARCH_DIRECTIVES } from "util/constants/search-directives";

export interface SearchDirective {
	key: string;
	option: string | null;
	value: string;
}

type DirectiveModes = "!" | ">" | ">=" | "<" | "<=" | "~";

export interface Directive {
	key: string;
	// :! - EXACT
	// :> - GREATER THAN
	// :>= - GREATER THAN OR EQ
	// :< - LESS THAN
	// :<= - LESS THAN OR EQ
	// :~ - REGEXP
	mode: DirectiveModes | null;
	value: string;
}

// Regex is an irritatingly write-only language, so i've split this one
// up.

// KEY   = /([^ ]+):/ - Parses the key name
// MODE  = /(>=|<=|!|>|<)?/ - parses the optional directive
// VALUE = /("(?:\\"|[^"])+"|[^ ]+)/ - Parses the value.

export function ParseDirectives(search: string): Directive[] {
	const parsedSearch = search.matchAll(/([^ ]+):(>=|<=|!|>|<|~)?("(?:\\"|[^"])+"|[^ ]+)/gu);

	const searchDirectives = [];
	for (const ps of parsedSearch) {
		if (ps.length !== 4) {
			continue;
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_wholeMatch, key, mode, value] = ps;

		let v = value;

		// strip surrounding quotes from quoted values - since we don't want the quotes!
		// I tried doing this inside the regex but it proved awful, so, here we are!
		if (value.startsWith('"') && value.endsWith('"')) {
			v = value.substring(1, value.length - 1);
		}

		searchDirectives.push({
			key: key.toLowerCase(),
			mode: (mode || null) as Directive["mode"],
			value: v,
		});
	}

	return searchDirectives;
}

type MatchFn = (searchValue: string, dataValue: string | number) => boolean;

const Matchers: Record<DirectiveModes, MatchFn> = {
	// Exact: Make sure this string is exactly the data value.
	"!": (sv, dv) => sv === dv.toString(),
	// LT, LTE, GT, GTE: If the data value is a number, compare numerically. If the data value is a string
	// compare alphabetically.
	// equality for alphabetical is implemented as .startsWith case insensitively.
	"<": (sv, dv) => {
		if (typeof dv === "number") {
			return dv < Number(sv);
		}

		return dv.localeCompare(sv) < 0;
	},
	"<=": (sv, dv) => {
		if (typeof dv === "number") {
			return dv <= Number(sv);
		}

		return dv.localeCompare(sv) <= 0 || dv.toLowerCase().startsWith(sv.toLowerCase());
	},
	">": (sv, dv) => {
		if (typeof dv === "number") {
			return dv > Number(sv);
		}

		return dv.localeCompare(sv) > 0;
	},
	">=": (sv, dv) => {
		if (typeof dv === "number") {
			return dv >= Number(sv);
		}

		return dv.localeCompare(sv) > 0 || dv.toLowerCase().startsWith(sv.toLowerCase());
	},
	// Regex: run the contents of value as if it were a regex. Lol.
	"~": (sv, dv) =>
		!!(Array.isArray(dv) ? dv[0] : dv).toString().match(new RegExp(sv, "u"))?.length,
};

const NeutralMatch = (sv: string, dv: string) => dv.toLowerCase().includes(sv.toLowerCase());

function GetStrData(dataValue: string | number | [string, number]) {
	if (typeof dataValue === "string") {
		return dataValue;
	} else if (typeof dataValue === "number") {
		return dataValue.toString();
	}

	return dataValue[0];
}

/**
 * Check whether the directive given matches the data.
 * @param directiveNumValue - If dataValue is hybrid, then this needs to be passed to compare numbers correctly.
 * @returns True if match, False if not.
 */
function DirectiveMatch(
	directive: Directive,
	dataValue: string | number | [string, number],
	directiveNumValue?: number
) {
	if (!directive.mode) {
		return NeutralMatch(directive.value, GetStrData(dataValue));
	}

	if (directive.mode === SEARCH_DIRECTIVES.REGEX) {
		try {
			return Matchers[SEARCH_DIRECTIVES.REGEX](directive.value, GetStrData(dataValue));
		} catch {
			// handle nonsense regex
			return false;
		}
	}

	// use directiveNumValue if hybrid mode is on
	if ([">", ">=", "<", "<="].includes(directive.mode) && Array.isArray(dataValue)) {
		return Matchers[directive.mode](directiveNumValue!.toString(), dataValue[1]);
	}

	return Matchers[directive.mode](directive.value, GetStrData(dataValue));
}

/**
 * The job of a value getter is to retrieve either a number or a string from a document
 * in the dataset.
 *
 * The third confusing option is a hybrid type, where it works like a string externally but
 * a number for >= style comparisons. The value getter must return a tri-tuple of its string value,
 * its numerical value, and a function to convert the users string request to a number.
 */
export type ValueGetter<D> = (data: D) => string | number;

export type ValueGetterOrHybrid<D> =
	| {
			valueGetter: (data: D) => [string, number];
			strToNum: (s: string) => number | null;
	  }
	| ValueGetter<D>;

export function GetValueGetter<D>(v: ValueGetterOrHybrid<D>) {
	if (typeof v === "function") {
		return v;
	}

	return v.valueGetter;
}

export function ComposeSearchFunction<D>(
	valueGetters: Record<string, ValueGetterOrHybrid<D>>
): ZTableSearchFn<D> {
	const allGetters = Object.values(valueGetters);

	return (search, data) => {
		const directives = ParseDirectives(search);

		if (directives.length === 0) {
			return allGetters.some(vgOrHybrid =>
				NeutralMatch(search, GetStrData(GetValueGetter(vgOrHybrid)(data)))
			);
		}

		for (const directive of directives) {
			const vgOrHybrid = valueGetters[directive.key];

			if (!vgOrHybrid) {
				continue;
			}

			const dataValue = GetValueGetter(vgOrHybrid)(data);

			let directiveNumValue;

			// is hybrid
			if (Array.isArray(dataValue) && typeof vgOrHybrid !== "function") {
				directiveNumValue = vgOrHybrid.strToNum(directive.value);

				if (directiveNumValue === null) {
					return false;
				}
			}

			if (!DirectiveMatch(directive, dataValue, directiveNumValue)) {
				return false;
			}
		}

		return true;
	};
}
