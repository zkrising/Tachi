import { SearchFunctions } from "util/ztable/search";
import DebugContent from "components/util/DebugContent";
import React from "react";
import { CellsRenderFN, ChangeIndicator } from "types/seeds";
import SeedsIndicatorCell from "../cells/SeedsIndicatorCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { EmptyHeader } from "../headers/IndicatorHeader";

export default function MakeSeedsTable<T>({
	dataset,
	headers: _headers,
	Cells,
	indicate = null,
	searchFns,
	entryName,
}: {
	headers: Header<T>[];
	dataset: T[];
	indicate?: ChangeIndicator;
	searchFns: SearchFunctions<T>;
	Cells: CellsRenderFN<T>;
	entryName: string;
}) {
	// clone headers so as to not mutate global state
	const headers = _headers.slice(0);

	if (indicate) {
		headers.unshift(EmptyHeader);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName={entryName}
			searchFunctions={searchFns}
			rowFunction={(data) => (
				<DropdownRow dropdown={<DebugContent data={{ ...data, __related: undefined }} />}>
					{indicate && <SeedsIndicatorCell indicate={indicate} />}
					<Cells data={data} />
				</DropdownRow>
			)}
		/>
	);
}
