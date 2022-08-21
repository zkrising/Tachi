/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-await-in-loop */
import logger from "../logger";
import { ChunkifyPromiseAll, GetBaseline, GetFString, GetScoresForMD5 } from "../util";
import { DifficultyComputer } from "../util/calc";
import { fmtSgl } from "util/format-sgl";
import { toInsane } from "util/sigma-to-insane";
import type { TableRes } from "../fetch-tables";
import type { CalcReturns } from "../types";

/**
 * Sieglinde V1 calc. This was wrote by JiminP, and determines "player skill" and
 * compares it against clear rates on each songs. This is circular, so it runs for
 * a while until the alpha converges.
 */
export default async function SieglindeV1Calc(tableInfo: TableRes): Promise<Array<CalcReturns>> {
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
			const ecSigma = ecComputer.songDifficulty.get(chart.md5)!;
			const hcSigma = hcComputer.songDifficulty.get(chart.md5)!;

			// @hack
			// This is *taped* on, and should be done properly in the future!
			const ecVal = toInsane(ecSigma);
			const hcVal = toInsane(hcSigma);

			return {
				md5: chart.md5,
				title: chart.title,
				baseLevel: GetFString(tableInfo.table, chart),

				ec: ecVal,
				ecStr: fmtSgl(ecVal),

				hc: hcVal,
				hcStr: fmtSgl(hcVal),

				ecMetric: ecSigma,
				hcMetric: hcSigma,
			};
		});
}
