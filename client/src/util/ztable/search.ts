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

		// strip surrounding quotes
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
	"!": (sv, dv) => sv === dv.toString(),
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
	"~": (sv, dv) => !!dv.toString().match(new RegExp(sv, "u"))?.length,
};

const NeutralMatch: MatchFn = (sv, dv) =>
	dv
		.toString()
		.toLowerCase()
		.includes(sv.toLowerCase());

function DirectiveMatch(directive: Directive, dataValue: string | number) {
	if (!directive.mode) {
		return NeutralMatch(directive.value, dataValue);
	}

	if (directive.mode === SEARCH_DIRECTIVES.REGEX) {
		try {
			return Matchers[SEARCH_DIRECTIVES.REGEX](directive.value, dataValue);
		} catch {
			// handle nonsense regex
			return false;
		}
	}

	return Matchers[directive.mode](directive.value, dataValue);
}

export function ComposeSearchFunction<D>(
	valueGetters: Record<string, (data: D) => string | number>
): ZTableSearchFn<D> {
	const allGetters = Object.values(valueGetters);

	return (search, data) => {
		const directives = ParseDirectives(search);

		if (directives.length === 0) {
			return allGetters.some(valueGetter => NeutralMatch(search, valueGetter(data)));
		}

		for (const directive of directives) {
			const valueGetter = valueGetters[directive.key];

			if (!valueGetter) {
				continue;
			}

			const dataValue = valueGetter(data);

			if (!DirectiveMatch(directive, dataValue)) {
				return false;
			}
		}

		return true;
	};
}
