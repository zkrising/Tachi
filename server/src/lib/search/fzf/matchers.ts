/* eslint-disable */
// @ts-nocheck

import { computeExtendedMatch } from "./extended";
import { buildPatternForBasicMatch, buildPatternForExtendedMatch } from "./pattern";
import { slab } from "./slab";
import type { BaseFinder, SyncFinder, AsyncFinder } from "./finders";
import type { FzfResultItem, Token } from "./types";

function getResultFromScoreMap<T>(
	scoreMap: Record<number, Array<FzfResultItem<T>>>,
	limit: number
): Array<FzfResultItem<T>> {
	const scoresInDesc = Object.keys(scoreMap)
		.map((v) => parseInt(v, 10))
		.sort((a, b) => b - a);

	let result: Array<FzfResultItem<T>> = [];

	for (const score of scoresInDesc) {
		result = result.concat(scoreMap[score]);
		if (result.length >= limit) {
			break;
		}
	}

	return result;
}

function getBasicMatchIter<U>(
	this: BaseFinder<ReadonlyArray<U>>,
	scoreMap: Record<number, Array<FzfResultItem<U>>>,
	queryRunes: Array<number>,
	caseSensitive: boolean
) {
	return (idx: number) => {
		const itemRunes = this.runesList[idx];

		if (queryRunes.length > itemRunes.length) {
			return;
		}

		let [match, positions] = this.algoFn(
			caseSensitive,
			this.opts.normalize,
			this.opts.forward,
			itemRunes,
			queryRunes,
			true,
			slab
		);

		if (match.start === -1) {
			return;
		}

		// We don't get positions array back for exact match, so we'll fill it by ourselves.
		if (this.opts.fuzzy === false) {
			positions = new Set();
			for (let position = match.start; position < match.end; ++position) {
				positions.add(position);
			}
		}

		// If we aren't sorting, we'll put all items in the same score bucket
		// (we've chosen zero score for it below). This will result in us getting
		// items in the same order in which we've send them in the list.
		const scoreKey = this.opts.sort ? match.score : 0;

		if (scoreMap[scoreKey] === undefined) {
			scoreMap[scoreKey] = [];
		}

		scoreMap[scoreKey].push({
			item: this.items[idx],
			...match,
			positions: positions ?? new Set(),
		});
	};
}

function getExtendedMatchIter<U>(
	this: BaseFinder<ReadonlyArray<U>>,
	scoreMap: Record<number, Array<FzfResultItem<U>>>,
	pattern: ReturnType<typeof buildPatternForExtendedMatch>
) {
	return (idx: number) => {
		const runes = this.runesList[idx];
		const match = computeExtendedMatch(runes, pattern, this.algoFn, this.opts.forward);

		if (match.offsets.length !== pattern.termSets.length) {
			return;
		}

		let sidx = -1;
		let eidx = -1;

		if (match.allPos.size > 0) {
			sidx = Math.min(...match.allPos);
			eidx = Math.max(...match.allPos) + 1;
		}

		const scoreKey = this.opts.sort ? match.totalScore : 0;

		if (scoreMap[scoreKey] === undefined) {
			scoreMap[scoreKey] = [];
		}

		scoreMap[scoreKey].push({
			score: match.totalScore,
			item: this.items[idx],
			positions: match.allPos,
			start: sidx,
			end: eidx,
		});
	};
}

// Sync matchers:

export function basicMatch<U>(this: SyncFinder<ReadonlyArray<U>>, query: string) {
	const { queryRunes, caseSensitive } = buildPatternForBasicMatch(
		query,
		this.opts.casing,
		this.opts.normalize
	);

	const scoreMap: Record<number, Array<FzfResultItem<U>>> = {};

	const iter = getBasicMatchIter.bind(this as BaseFinder<ReadonlyArray<U>>)(
		scoreMap,
		queryRunes,
		caseSensitive
	);

	for (let i = 0, len = this.runesList.length; i < len; ++i) {
		iter(i);
	}

	return getResultFromScoreMap(scoreMap, this.opts.limit);
}

export function extendedMatch<U>(this: SyncFinder<ReadonlyArray<U>>, query: string) {
	const pattern = buildPatternForExtendedMatch(
		Boolean(this.opts.fuzzy),
		this.opts.casing,
		this.opts.normalize,
		query
	);

	const scoreMap: Record<number, Array<FzfResultItem<U>>> = {};

	const iter = getExtendedMatchIter.bind(this as BaseFinder<ReadonlyArray<U>>)(scoreMap, pattern);

	for (let i = 0, len = this.runesList.length; i < len; ++i) {
		iter(i);
	}

	return getResultFromScoreMap(scoreMap, this.opts.limit);
}

// Async matchers:

const isNode =
	// @ts-expect-error TS is configured for browsers so `require` is not present.
	// This is also why we aren't using @ts-expect-error
	typeof require !== "undefined" && typeof window === "undefined";

function asyncMatcher<F>(
	token: Token,
	len: number,
	iter: (index: number) => unknown,
	onFinish: () => F
): Promise<F> {
	return new Promise((resolve, reject) => {
		const INCREMENT = 1000;
		let i = 0;
		let end = Math.min(INCREMENT, len);

		const step = () => {
			if (token.cancelled) {
				reject("search cancelled");
				return;
			}

			for (; i < end; ++i) {
				iter(i);
			}

			if (end < len) {
				end = Math.min(end + INCREMENT, len);
				isNode
					? // @ts-expect-error unavailable or deprecated for browsers
					  setImmediate(step)
					: setTimeout(step);
			} else {
				resolve(onFinish());
			}
		};

		step();
	});
}

export function asyncBasicMatch<U>(
	this: AsyncFinder<ReadonlyArray<U>>,
	query: string,
	token: Token
): Promise<Array<FzfResultItem<U>>> {
	const { queryRunes, caseSensitive } = buildPatternForBasicMatch(
		query,
		this.opts.casing,
		this.opts.normalize
	);

	const scoreMap: Record<number, Array<FzfResultItem<U>>> = {};

	return asyncMatcher(
		token,
		this.runesList.length,
		getBasicMatchIter.bind(this as BaseFinder<ReadonlyArray<U>>)(
			scoreMap,
			queryRunes,
			caseSensitive
		),
		() => getResultFromScoreMap(scoreMap, this.opts.limit)
	);
}

export function asyncExtendedMatch<U>(
	this: AsyncFinder<ReadonlyArray<U>>,
	query: string,
	token: Token
) {
	const pattern = buildPatternForExtendedMatch(
		Boolean(this.opts.fuzzy),
		this.opts.casing,
		this.opts.normalize,
		query
	);

	const scoreMap: Record<number, Array<FzfResultItem<U>>> = {};

	return asyncMatcher(
		token,
		this.runesList.length,
		getExtendedMatchIter.bind(this as BaseFinder<ReadonlyArray<U>>)(scoreMap, pattern),
		() => getResultFromScoreMap(scoreMap, this.opts.limit)
	);
}
