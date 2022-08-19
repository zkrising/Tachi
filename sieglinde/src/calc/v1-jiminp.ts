/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-await-in-loop */
import logger from "../logger";
import { ChunkifyPromiseAll, GetBaseline, GetFString, GetScoresForMD5 } from "../util";
import { DifficultyComputer } from "../util/calc";
import type { TableRes } from "../fetch-tables";
import type { CalcReturns } from "../types";

/**
 * Sieglinde V1 calc. This is an incredibly naive implementation of a difficulty
 * engine.
 *
 * The idea is simple - given a base level, check how much the clear rate deviates
 * for the norm for that base level, and adjust the level accordingly. There isn't
 * much complex going on. Just basic maths.
 *
 * This, however, completely does not work. We genuinely cannot use this at all.
 */
export default async function SieglindeV2Calc(tableInfo: TableRes): Promise<Array<CalcReturns>> {
	// We can't do this in full-parallel. The LR2IR hyper-aggressively rate limits this stuff.
	const promises = tableInfo.charts.map((chart) => async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const baseLine = GetBaseline(tableInfo.table, chart.level);

		if (baseLine === null) {
			logger.info(`Skipped level ${tableInfo.table.name} ${chart.level}`);
			return [];
		}

		const scores = (await GetScoresForMD5(chart.md5)).filter(
			(d: { clear: number; minbp: number; notes: number }) =>
				d.clear > 0 && d.minbp < d.notes * 0.2
		);

		// 0 -> noplay, 1 -> failed.. etc.
		return scores.map(
			(score: { id: number; clear: number }): [string, number, { clear: number }] => [
				chart.md5,
				score.id,
				score,
			]
		);
	});

	const dataArr: Array<Array<[string, number, { clear: number }]>> = await ChunkifyPromiseAll(
		promises,
		100
	);

	const data = dataArr.flat();
	const ecComputer = new DifficultyComputer(
		data.map(([chart, user, score]) => [chart, user, score.clear > 1 ? 1 : -1])
	);
	const hcComputer = new DifficultyComputer(
		data.map(([chart, user, score]) => [chart, user, score.clear > 3 ? 1 : -1])
	);

	ecComputer.computeDifficulty();
	hcComputer.computeDifficulty();

	return tableInfo.charts
		.filter((chart) => ecComputer.songDifficulty.has(chart.md5))
		.map((chart) => {
			const ecValue = ecComputer.songDifficulty.get(chart.md5)!;
			const ecPrefix = "σ";

			const hcValue = hcComputer.songDifficulty.get(chart.md5)!;
			const hcPrefix = "σ";

			return {
				md5: chart.md5,
				title: chart.title,
				baseLevel: GetFString(tableInfo.table, chart),
				ec: ecValue,
				ecStr: `${ecPrefix}${ecValue.toFixed(2)}`,
				hc: hcValue,
				hcStr: `${hcPrefix}${hcValue.toFixed(2)}`,
			};
		});
}
