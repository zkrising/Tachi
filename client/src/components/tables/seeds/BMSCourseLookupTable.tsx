import { NumericSOV, StrSOV } from "util/sorts";
import Muted from "components/util/Muted";
import React from "react";
import { BMSCourseDataset } from "types/tables";
import TachiTable, { Header } from "../components/TachiTable";

export default function BMSCourseLookupTable({ dataset }: { dataset: BMSCourseDataset }) {
	const headers: Header<BMSCourseDataset[0]>[] = [
		["Title", "Title", StrSOV((x) => x.title)],
		["Set", "Set", StrSOV((x) => x.set)],
		["Playtype", "Playtype", StrSOV((x) => x.playtype)],
		["Value", "Value", NumericSOV((x) => x.value)],
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
				// todo: figure out how to put song titles in here, maybe?
			}}
			rowFunction={(x) => <Row data={x} />}
		/>
	);
}

function Row({ data }: { data: BMSCourseDataset[0] }) {
	// md5 hashes are 16 chars long; a bms course may be comprised of any amount of
	// md5s. This splits the string every 16 characters into an array.
	const md5s = data.md5sums.match(/.{16}/gu);

	if (!md5s) {
		return <div>TEMP ERRMSG</div>;
	}

	// sort songs by their md5 appearance.
	const songData = [];

	for (const md5 of md5s) {
		const chart = data.__related.charts.find((e) => e.data.hashMD5 === md5);

		if (!chart) {
			throw new Error(`MD5 of ${md5} points to chart that doesn't exist.`);
		}

		const song = data.__related.songs.find((e) => e.id === chart.songID);

		if (!song) {
			throw new Error(`Song ${chart.songID} does not exist, but has a child chart?`);
		}

		songData.push({ title: song.title, md5 });
	}

	return (
		<tr>
			<td>
				<span>{data.title}</span>
				{songData.map((e) => (
					<>
						<br />
						<span>{e.title}</span> <Muted>({e.md5})</Muted>
					</>
				))}
			</td>
			<td>
				<span>{data.set}</span>
			</td>
			<td>{data.playtype}</td>
			<td>{data.value}</td>
		</tr>
	);
}
