/* eslint-disable no-await-in-loop */
import { TableRes } from "../fetch-tables";
import logger from "../logger";
import { CalcReturns } from "../types";
import {
	ChunkifyPromiseAll,
	GetBaseline,
	GetFString,
	GetScoresForMD5,
	GetSigmoidalValue,
} from "../util";

interface ChartData {
	title: string;
	md5: string;
	ecRate: number;
	hcRate: number;
	scoreCount: any;
	baseLine: any;
	str: string;
}

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
export default async function SieglindeV0Calc(tableInfo: TableRes): Promise<CalcReturns[]> {
	// We can't do this in full-parallel. The LR2IR hyper-aggressively rate limits this stuff.

	const promises = tableInfo.charts.map((chart) => async () => {
		const baseLine = GetBaseline(tableInfo.table, chart.level);

		if (baseLine === null) {
			logger.info(`Skipped level ${tableInfo.table.name} ${chart.level}`);
			return null;
		}

		const scores = (await GetScoresForMD5(chart.md5)).filter((d) => d.minbp < d.notes * 0.2);

		// 0 -> noplay, 1 -> failed.. etc.
		const ecRate = scores.filter((e) => e.clear > 1).length / scores.length;
		const hcRate = scores.filter((e) => e.clear > 3).length / scores.length;

		const str = GetFString(tableInfo.table, chart);

		return {
			title: chart.title,
			md5: chart.md5,
			ecRate,
			hcRate,
			scoreCount: scores.length,
			baseLine,
			str,
		};
	});

	const dataset = (await ChunkifyPromiseAll(promises, 100)).filter(
		(k) => k !== null
	) as ChartData[];

	const tableLevelAverageClearRates = GetAverageClearRatesForLevel(dataset);

	const returns = [];

	for (const data of dataset) {
		const confidence = GetSigmoidalValue((data.scoreCount * data.ecRate) / 1000);

		const groupAverageECRate = tableLevelAverageClearRates[data.str].ecRate;
		const groupAverageHCRate = tableLevelAverageClearRates[data.str].hcRate;

		const ecDiff = (groupAverageECRate - data.ecRate) / groupAverageECRate;
		const hcDiff = (groupAverageECRate - data.hcRate) / groupAverageECRate;

		const ecValue = Math.max(0, data.baseLine + 10 * (Math.exp(ecDiff * confidence) - 1));

		const hcValue = Math.max(0, data.baseLine + 10 * (Math.exp(hcDiff * confidence) - 1));

		const ecPrefix = ecValue < 12.01 ? "☆" : "🟊";
		const hcPrefix = hcValue < 12.01 ? "☆" : "🟊";

		returns.push({
			md5: data.md5,
			title: data.title,
			baseLevel: data.str,
			ec: ecValue,
			ecStr: `${ecPrefix}${(ecValue < 12.01 ? ecValue : ecValue - 12).toFixed(2)}`,
			hc: hcValue,
			hcStr: `${hcPrefix}${(hcValue < 12.01 ? hcValue : hcValue - 12).toFixed(2)}`,
			// DEBUG
			ecRate: data.ecRate,
			ecGroupAvg: groupAverageECRate,
			ecDiff,
			hcRate: data.hcRate,
			hcGroupAvg: groupAverageHCRate,
			hcDiff,
			baseline: data.baseLine,
			confidence,
			totalScores: data.scoreCount,
		});
	}

	return returns;
}

function GetAverageClearRatesForLevel(dataset: ChartData[]) {
	const tableLevelTotalClearRates: Record<string, { ec: number; hc: number; total: number }> = {};

	for (const scoreRates of dataset) {
		if (!tableLevelTotalClearRates[scoreRates.str]) {
			tableLevelTotalClearRates[scoreRates.str] = {
				ec: scoreRates.ecRate,
				hc: scoreRates.hcRate,
				total: 1,
			};
		} else {
			const d = tableLevelTotalClearRates[scoreRates.str];

			d.ec += scoreRates.ecRate;
			d.hc += scoreRates.hcRate;
			d.total += 1;
		}
	}

	const tableLevelAverageClearRates: Record<string, { ecRate: number; hcRate: number }> = {};

	for (const [key, value] of Object.entries(tableLevelTotalClearRates)) {
		tableLevelAverageClearRates[key] = {
			ecRate: value.ec / value.total,
			hcRate: value.hc / value.total,
		};
	}

	return tableLevelAverageClearRates;
}
