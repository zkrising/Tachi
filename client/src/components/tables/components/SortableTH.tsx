import React, { HTMLAttributes } from "react";
import { SetState } from "types/react";

export default function SortableTH({
	name,
	sortingName = name,
	changeSort,
	currentSortMode,
	reverseSort,
	style = {},
}: {
	name: string;
	sortingName?: string;
	currentSortMode: string | null;
	reverseSort: boolean;
	changeSort: (s: string) => void;
	style?: HTMLAttributes<HTMLTableCellElement>["style"];
}) {
	return (
		<th onClick={() => changeSort(sortingName)} style={style}>
			<span className="mr-2">{name}</span>
			<span>
				<i
					className={`mr-1 flaticon2-arrow-up icon-sm sort-icon ${
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
