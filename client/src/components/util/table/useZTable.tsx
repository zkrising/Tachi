import { useEffect, useMemo, useState } from "react";
import { integer } from "tachi-common";
import deepmerge from "deepmerge";

type SortFN<T> = (a: T, b: T) => integer;

interface ZTableOptions<D> {
	pageLen: integer;
	search: string;
	searchFunction: (search: string, data: D) => boolean;
	entryName: string;
	defaultSortMode: string | null;
	defaultReverseSort: boolean;
	sortFunctions: Record<string, SortFN<D>>;
}

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

	const [page, setPage] = useState(1);
	const [pageState, setPageState] = useState<"start" | "middle" | "end" | "start-end">("start");
	const [displayStr, setDisplayStr] = useState(`Loading Data...`);

	const {
		search,
		entryName,
		pageLen,
		defaultReverseSort,
		searchFunction,
		sortFunctions,
		defaultSortMode,
	} = options;

	const [sortMode, setSortMode] = useState(defaultSortMode);
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

	useEffect(() => {
		if (page === maxPage && page === 1) {
			setPageState("start-end");
		} else if (page === maxPage) {
			setPageState("end");
		} else if (page === 1) {
			setPageState("start");
		} else {
			setPageState("middle");
		}

		setDisplayStr(
			`Displaying ${(page - 1) * pageLen + 1} to ${Math.min(
				page * pageLen,
				dataset.length
			)} of ${dataset.length} ${entryName}.`
		);
	}, [page, maxPage, dataset]);

	useEffect(() => {
		setPage(1);
		setDisplayStr(
			`Displaying ${(page - 1) * pageLen + 1} to ${Math.min(
				page * pageLen,
				dataset.length
			)} of ${dataset.length} ${entryName}.`
		);
	}, [dataset]);

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
