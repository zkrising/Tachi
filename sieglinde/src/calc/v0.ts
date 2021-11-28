/* eslint-disable no-await-in-loop */
import { TableRes } from "../fetch-tables";
import logger from "../logger";
import { CalcReturns } from "../types";
import { GetBaseline, GetFString, GetScoresForMD5, GetSigmoidalValue, Mean } from "../util";

/**
 * Sieglinde V0 calc. This is an incredibly naive implementation of a difficulty
 * engine.
 *
 * The idea is simple - given a base level, check how much the clear rate deviates
 * for the norm for that base level, and adjust the level accordingly. There isn't
 * much complex going on. Just basic maths.
 */
export default async function SieglindeV0Calc(tableInfo: TableRes): Promise<CalcReturns[]> {
	const dataset = [];

	for (const chart of tableInfo.charts) {
		const scores = await GetScoresForMD5(chart.md5);

		const ecRate = 0;
		const hcRate = 0;

		const baseLine = GetBaseline(tableInfo.table, chart.level);

		if (baseLine === null) {
			logger.info(`Skipped level ${tableInfo.table.name} ${chart.level}`);
			continue;
		}

		let nextBaseLine = GetBaseline(tableInfo.table, `${Number(chart.level) + 1}`);

		if (nextBaseLine === null) {
			logger.info(`No next baseline -- assuming +1.`);
			nextBaseLine = baseLine + 1;
		}

		const str = GetFString(tableInfo.table, chart);

		dataset.push({
			title: chart.title,
			md5: chart.md5,
			ecRate,
			hcRate,
			scoreCount: scores.length,
			baseLine,
			nextBaseLine,
			str,
		});
	}

	const groupAverageECRate = Mean(dataset.map((e) => e.ecRate));
	const groupAverageHCRate = Mean(dataset.map((e) => e.hcRate));

	const returns = [];

	for (const data of dataset) {
		const confidence = GetSigmoidalValue(data.scoreCount / 100);

		const ecDiff = groupAverageECRate - data.ecRate;
		const hcDiff = groupAverageHCRate - data.hcRate;

		const ecValue = Math.max(0, data.baseLine - ecDiff * confidence);
		const hcValue = Math.max(0, data.baseLine - hcDiff * confidence);

		const gutter = data.baseLine + data.nextBaseLine;

		const ecLerp = gutter * 0.5 - (ecDiff * confidence) / gutter;
		const hcLerp = gutter * 0.5 - (hcDiff * confidence) / gutter;

		const ecStr = data.str + ecLerp.toFixed(2);
		const hcStr = data.str + hcLerp.toFixed(2);

		logger.verbose(`${data.title} | EC: ${ecStr}, HC: ${hcStr}`);

		returns.push({
			md5: data.md5,
			title: data.title,
			ec: ecValue,
			ecStr,
			hc: hcValue,
			hcStr,
		});
	}

	return returns;
}
