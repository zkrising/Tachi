import GetTableData from "../fetch-tables";
import { ChunkifyPromiseAll, GetScoresForMD5 } from "../util";
import type { Playtypes } from "tachi-common";

export default async function FetchAllTableScores(playtype: Playtypes["bms"]) {
	const tableInfo = await GetTableData(playtype);

	const promises = [];

	for (const table of tableInfo) {
		for (const chart of table.charts) {
			promises.push(() => GetScoresForMD5(chart.md5));
		}
	}

	await ChunkifyPromiseAll(promises, 100);
}

if (require.main === module) {
	void FetchAllTableScores("7K");
	void FetchAllTableScores("14K");
}
