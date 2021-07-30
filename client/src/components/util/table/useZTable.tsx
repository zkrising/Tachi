import { useMemo, useState } from "react";
import { integer } from "tachi-common";
import deepmerge from "deepmerge";

export type ZTableSortFn<D> = (a: D, b: D) => integer;
export type ZTableSearchFn<D> = (search: string, data: D) => boolean;

interface ZTableOptions<D> {
	pageLen: integer;
	search: string;
	searchFunction: ZTableSearchFn<D>;
	entryName: string;
	defaultSortMode: string | null;
	defaultReverseSort: boolean;
	sortFunctions: Record<string, ZTableSortFn<D>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DefaultOptions: ZTableOptions<any> = {
	pageLen: 10,
	search: "",
	searchFunction: () => true,
	entryName: "entries",
	defaultSortMode: null,
	defaultReverseSort: false,
	sortFunctions: {},
};

export function useZTable<D>(originalDataset: D[], providedOptions?: Partial<ZTableOptions<D>>) {
	// override all default options with any provided ones.
	const options: ZTableOptions<D> = deepmerge(DefaultOptions, providedOptions ?? {});

	const {
		search,
		entryName,
		pageLen,
		defaultReverseSort,
		searchFunction,
		sortFunctions,
		defaultSortMode,
	} = options;

	const [page, setPage] = useState(1);

	// what we're currently sorting on. If null, use natural order.
	const [sortMode, setSortMode] = useState(defaultSortMode);

	// whether we're sorting descendingly or not.
	const [reverseSort, setReverseSort] = useState(defaultReverseSort);

	const dataset = useMemo(() => {
		let mutatedSet = originalDataset;

		if (search !== "") {
			mutatedSet = mutatedSet.filter(v => searchFunction(search, v));
			setPage(1);
		}

		if (sortMode !== null) {
			mutatedSet = mutatedSet.slice().sort(sortFunctions[sortMode]);
			if (reverseSort) {
				mutatedSet.reverse();
			}
		}

		return mutatedSet;
	}, [search, originalDataset, sortMode, reverseSort]);

	const maxPage = useMemo(() => Math.ceil(dataset.length / pageLen), [dataset]);

	const pageState = useMemo(() => {
		if ((page === maxPage && page === 1) || maxPage === 0) {
			return "start-end";
		} else if (page === maxPage) {
			return "end";
		} else if (page === 1) {
			return "start";
		}

		return "middle";
	}, [page, maxPage, dataset]);

	const displayStr = useMemo(() => {
		if (dataset.length === 0) {
			if (search !== "") {
				return `Displaying no ${entryName}. Your search might be too narrow.`;
			}

			return `Displaying no ${entryName}.`;
		}

		return `Displaying ${(page - 1) * pageLen + 1} to ${Math.min(
			page * pageLen,
			dataset.length
		)} of ${dataset.length} ${entryName.toLowerCase()}${search !== "" && " (Filtered)"}.`;
	}, [page, dataset]);

	// Create a sliding window that can be used for pagination.
	const window = useMemo(() => dataset.slice((page - 1) * pageLen, page * pageLen), [
		page,
		dataset,
		search,
	]);

	// simple utilities for previous and next buttons
	const incrementPage = () => {
		setPage(page + 1);
	};

	const decrementPage = () => {
		setPage(page - 1);
	};

	// utility for sorting
	const changeSort = (sort: string) => {
		if (sortMode === sort) {
			setReverseSort(!reverseSort);
		} else {
			setSortMode(sort);
			// desc sort is default
			setReverseSort(true);
		}
	};

	return {
		window,
		incrementPage,
		decrementPage,
		pageState,
		page,
		setPage,
		maxPage,
		displayStr,
		sortMode,
		changeSort,
		reverseSort,
	};
}
