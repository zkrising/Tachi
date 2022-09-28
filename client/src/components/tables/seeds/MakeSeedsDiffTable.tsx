import { HeadersToDiffHeaders, SearchFnsToDiffSearchFns } from "util/seeds";
import { SearchFunctions } from "util/ztable/search";
import Muted from "components/util/Muted";
import React from "react";
import { Col } from "react-bootstrap";
import { CellsRenderFN, DiffSeedsCollection } from "types/seeds";
import SeedsDiffCell from "../cells/SeedsDiffCell";
import SeedsIndicatorCell from "../cells/SeedsIndicatorCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";

/**
 * Given all the necessary parts of a normal seeds table, render a table showing
 * its diffs instead.
 */
export default function MakeSeedsDiffTable<T>({
	headers,
	dataset,
	searchFns,
	entryName,
	Cells,
}: {
	headers: Header<T>[];
	dataset: DiffSeedsCollection<T>[];
	searchFns: SearchFunctions<T>;
	entryName: string;
	Cells: CellsRenderFN<T>;
}) {
	return (
		<TachiTable
			dataset={dataset}
			headers={HeadersToDiffHeaders(headers)}
			entryName={entryName}
			searchFunctions={SearchFnsToDiffSearchFns(searchFns)}
			rowFunction={(x) => <DiffRow data={x} Cells={Cells} />}
		/>
	);
}

function DiffRow<T>({ data, Cells }: { data: DiffSeedsCollection<T>; Cells: CellsRenderFN<T> }) {
	return (
		<DropdownRow
			dropdown={
				<div className="row">
					<Col xs={12} className="mt-2">
						<table className="table">
							<thead>
								<tr>
									<td colSpan={100}>Old Entry</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<Cells data={data.base} />
								</tr>
							</tbody>
						</table>
						<br />
						<Muted>
							(This is what the row looked like before changes were applied.)
						</Muted>
					</Col>
				</div>
			}
		>
			<SeedsIndicatorCell indicate="MODIFIED" />
			<Cells data={data.head} compress />
			<SeedsDiffCell diffs={data.diff} />
		</DropdownRow>
	);
}
