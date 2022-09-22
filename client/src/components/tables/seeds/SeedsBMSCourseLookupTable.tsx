import { StrSOV } from "util/sorts";
import React from "react";
import { FormatChart } from "tachi-common";
import { BMSCourseWithRelated } from "types/seeds";
import DebugContent from "components/util/DebugContent";
import TachiTable, { Header } from "../components/TachiTable";
import DropdownRow from "../components/DropdownRow";

export default function SeedsBMSCourseLookupTable({
	dataset,
}: {
	dataset: BMSCourseWithRelated[];
}) {
	const headers: Header<BMSCourseWithRelated>[] = [
		["Title", "Title", StrSOV((x) => x.title)],
		["Charts", "Charts", StrSOV((x) => x.title)],
		["MD5s", "MD5s", StrSOV((x) => x.title)],
		[
			"Set (Index)",
			"Set (Idx)",
			(a, b) => {
				const a2 = `${a.playtype} ${a.set}`;
				const b2 = `${b.playtype} ${b.set}`;

				if (a2 === b2) {
					return a.value - b.value;
				}

				return a2.localeCompare(b2);
			},
		],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="BMS Courses"
			searchFunctions={{
				title: (x) => x.title,
				set: (x) => `${x.playtype} ${x.set}`,
				md5: (x) => x.md5sums,
				value: (x) => x.value,
				playtype: (x) => x.playtype,
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
		<DropdownRow dropdown={<DebugContent data={{ ...data, __related: undefined }} />}>
			<td>
				<strong>{data.title}</strong>
			</td>
			<td className="text-left">
				{data.__related.entries.map((e, i) => (
					<div key={i} className="d-flex w-100">
						{typeof e === "string" ? (
							<span className="text-danger">UNKNOWN CHART</span>
						) : (
							<span>{FormatChart("bms", e.song, e.chart)} </span>
						)}
					</div>
				))}
			</td>
			<td>
				{data.__related.entries.map((e, i) => (
					<div key={i}>
						<code>{typeof e === "string" ? e : e.chart.data.hashMD5}</code>
					</div>
				))}
			</td>
			<td>
				{data.playtype} {data.set} ({data.value})
			</td>
		</DropdownRow>
	);
}
