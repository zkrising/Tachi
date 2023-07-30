import Icon from "components/util/Icon";
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
		<th onClick={() => changeSort(sortingName)} style={style}>
			<div className="d-flex flex-column text-nowrap gap-1">
				<span className="d-none d-xl-block">{name}</span>
				<span className="d-block d-xl-none">{shortName}</span>
				<span className="d-flex justify-content-center gap-1">
					<Icon
						type="arrow-up"
						className={
							currentSortMode === sortingName && reverseSort
								? "opacity-100"
								: "opacity-25"
						}
					/>
					<Icon
						type="arrow-down"
						className={
							currentSortMode === sortingName && !reverseSort
								? "opacity-100"
								: "opacity-25"
						}
					/>
				</span>
			</div>
		</th>
	);
}
