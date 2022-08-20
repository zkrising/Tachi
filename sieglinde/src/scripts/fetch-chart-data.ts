import GetTableData from "../fetch-tables";
import { ChunkifyPromiseAll, GetScoresForMD5 } from "../util";

export default async function FetchAllTableScores() {
	const tableInfo = await GetTableData();

	const promises = [];

	for (const table of tableInfo) {
		for (const chart of table.charts) {
			promises.push(() => GetScoresForMD5(chart.md5));
		}
	}

	await ChunkifyPromiseAll(promises, 100);
}

if (require.main === module) {
	void FetchAllTableScores();
}
