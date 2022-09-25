import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import React from "react";
import { FormatChart } from "tachi-common";
import { BMSCourseWithRelated, CellsRenderFN } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsBMSCourseLookupHeaders: Header<BMSCourseWithRelated>[] = [
	["Title", "Title", StrSOV((x) => x.title)],
	["Charts", "Charts", StrSOV((x) => x.title)],
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

export const SeedsBMSCourseLookupSearchFns: SearchFunctions<BMSCourseWithRelated> = {
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
};

export const SeedsBMSCourseLookupCells: CellsRenderFN<BMSCourseWithRelated> = ({
	data,
	compress,
}) => (
	<>
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

					{!compress && (
						<div className="ml-auto" key={i}>
							<code>{typeof e === "string" ? e : e.chart.data.hashMD5}</code>
						</div>
					)}
				</div>
			))}
		</td>
		<td>
			{data.playtype} {data.set} ({data.value})
		</td>
	</>
);
