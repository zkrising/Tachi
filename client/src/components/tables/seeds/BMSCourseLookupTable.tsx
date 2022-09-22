import { NumericSOV, StrSOV } from "util/sorts";
import Muted from "components/util/Muted";
import React from "react";
import { BMSCourseWithRelated } from "types/seeds";
import { FormatChart } from "tachi-common";
import TachiTable, { Header } from "../components/TachiTable";

export default function BMSCourseLookupTable({ dataset }: { dataset: BMSCourseWithRelated[] }) {
	const headers: Header<BMSCourseWithRelated>[] = [
		["Title", "Title", StrSOV((x) => x.title)],
		["Set (Index)", "Set (Idx)", StrSOV((x) => x.set)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="BMS Courses"
			searchFunctions={{
				title: (x) => x.title,
				set: (x) => x.set,
				md5: (x) => x.md5sums,
				value: (x) => x.value,
				// don't ask
				// it gets all the songtitles and joins them
				song: (x) =>
					x.__related.entries
						.map((e) => {
							if (typeof e === "string") {
								return `UNKNOWN CHART (${e})`;
							}

							return FormatChart("bms", e.song, e.chart);
						})
						.join("\n"),
			}}
			rowFunction={(x) => <Row data={x} />}
		/>
	);
}

function Row({ data }: { data: BMSCourseWithRelated }) {
	return (
		<tr>
			<td className="text-left">
				<div className="mb-4">
					<strong>{data.title}</strong>
				</div>
				{data.__related.entries.map((e) => (
					<>
						<br />
						{typeof e === "string" ? (
							<span className="text-danger">UNKNOWN CHART ({e})</span>
						) : (
							<span>{FormatChart("bms", e.song, e.chart)}</span>
						)}
					</>
				))}
			</td>
			<td>
				{data.playtype} {data.set} ({data.value})
			</td>
		</tr>
	);
}
