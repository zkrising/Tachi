/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-await-in-loop */
import logger from "../logger";
import { ChunkifyPromiseAll, GetBaseline, GetFString, GetScoresForMD5 } from "../util";
import { DifficultyComputer } from "../util/calc";
import fs from "fs";
import path from "path";
import { fmtSgl } from "util/format-sgl";
import { lerpBetwixt } from "util/lerp";
import type { TableRes } from "../fetch-tables";
import type { CalcReturns } from "../types";
import type { Computations } from "../util/calc";
import type { EcConstants } from "util/lerp";

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
		return scores.map((score: { id: number; clear: number }) => ({
			md5: chart.md5,
			userID: score.id,
			clear: score.clear,
		}));
	});

	const dataArr = await ChunkifyPromiseAll(promises, 100);

	const data = dataArr.flat();

	const ecComputer = new DifficultyComputer(
		data.map((d) => ({
			...d,

			// better than or equal to ec
			clear: d.clear >= 2,
		}))
	);

	const hcComputer = new DifficultyComputer(
		data.map((d) => ({
			...d,

			// better than or equal to hc
			clear: d.clear >= 4,
		}))
	);

	calcRegressionsOrCache(ecComputer, `${tableInfo.table.name}-ec`);
	calcRegressionsOrCache(hcComputer, `${tableInfo.table.name}-hc`);

	const chartsWithLevels = tableInfo.charts.filter((chart) =>
		ecComputer.songDifficulty.has(chart.md5)
	);

	const cutoffs: Record<string, { count: number; sum: number }> = {};

	// create a record of { insane1: count, sum }
	for (const chart of chartsWithLevels) {
		const existingCutoff = cutoffs[chart.level];

		if (!existingCutoff) {
			cutoffs[chart.level] = {
				count: 1,
				sum: ecComputer.songDifficulty.get(chart.md5)!,
			};
		} else {
			cutoffs[chart.level] = {
				count: existingCutoff.count + 1,
				sum: existingCutoff.sum + ecComputer.songDifficulty.get(chart.md5)!,
			};
		}
	}

	// warning: stupid
	const avgCutoffs: EcConstants = Object.entries(cutoffs)
		.map(([key, data]) => ({
			levelName: key,
			averageSigma: data.sum / data.count,
		}))

		// @warning
		// This is **completely broken** if a harder tier in the table
		// has a worse average sigma. This will catastrophically break lerpwise.
		.sort((a, b) => a.averageSigma - b.averageSigma);

	return chartsWithLevels.map((chart) => {
		const ecSigma = ecComputer.songDifficulty.get(chart.md5)!;
		const hcSigma = hcComputer.songDifficulty.get(chart.md5)!;

		// @hack
		// This is *taped* on, and should be done properly in the future!
		const ecVal = lerpBetwixt(ecSigma, avgCutoffs, tableInfo.table);
		const hcVal = lerpBetwixt(hcSigma, avgCutoffs, tableInfo.table);

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

/**
 * If regression data exists in the cache, use that instead to avoid recalcing
 * regressions.
 */
function calcRegressionsOrCache(computer: DifficultyComputer, tag: string) {
	try {
		const data = JSON.parse(
			fs.readFileSync(
				path.join(__dirname, `../cache/v1-calc-regressions/${tag}.json`),
				"utf-8"
			)
		) as Computations;

		computer.loadExistingComputations(data);
	} catch (err) {
		computer.computeDifficulty(tag);
	}
}
