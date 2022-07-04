import React, { HTMLAttributes } from "react";

export default function SortableTH({
	name,
	shortName,
	sortingName = name,
	changeSort,
	currentSortMode,
	reverseSort,
	style = {},
}: {
	name: string;
	shortName: string;
	sortingName?: string;
	currentSortMode: string | null;
	reverseSort: boolean;
	changeSort: (s: string) => void;
	style?: HTMLAttributes<HTMLTableCellElement>["style"];
}) {
	return (
		<th className="compressible-th" onClick={() => changeSort(sortingName)} style={style}>
			<span className="mr-2 d-none d-lg-block">{name}</span>
			<span className="mr-2 d-block d-lg-none">{shortName}</span>
			<span>
				<i
					className={`flaticon2-arrow-up icon-sm sort-icon ${
						currentSortMode === sortingName && reverseSort ? "active" : ""
					}`}
				></i>
				<i
					className={`flaticon2-arrow-down icon-sm sort-icon ${
						currentSortMode === sortingName && !reverseSort ? "active" : ""
					}`}
				></i>
			</span>
		</th>
	);
}
