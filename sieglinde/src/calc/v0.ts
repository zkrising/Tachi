/* eslint-disable no-await-in-loop */
import logger from "../logger";
import { GetBaseline, GetFString, GetScoresForMD5, GetSigmoidalValue, Mean } from "../util";
import type { TableRes } from "../fetch-tables";
import type { CalcReturns } from "../types";

/**
 * Sieglinde V0 calc. This just reads out hardcoded values for each table, with no fuzzing.
 */
export default function SieglindeV0Calc(tableInfo: TableRes): Array<CalcReturns> {
	const dataset = [];

	for (const chart of tableInfo.charts) {
		const baseLine = GetBaseline(tableInfo.table, chart.level);

		if (baseLine === null) {
			logger.info(`Skipped level ${tableInfo.table.name} ${chart.level}`);
			continue;
		}

		const str = GetFString(tableInfo.table, chart);

		dataset.push({
			title: chart.title,
			md5: chart.md5,
			ecRate: 0,
			hcRate: 0,
			scoreCount: 0,
			baseLine,
			str,
		});
	}

	const returns = [];

	for (const data of dataset) {
		const confidence = GetSigmoidalValue(data.scoreCount / 100);

		const ecDiff = 0; // groupAverageECRate - data.ecRate;
		const hcDiff = 0; // groupAverageHCRate - data.hcRate;

		const ecValue = Math.max(0, data.baseLine - ecDiff * confidence);
		const hcValue = Math.max(0, data.baseLine - hcDiff * confidence);

		const ecPrefix = ecValue < 12 ? "☆" : "🟊";
		const hcPrefix = hcValue < 12 ? "☆" : "🟊";

		returns.push({
			md5: data.md5,
			title: data.title,
			ec: ecValue,
			ecStr: `${ecPrefix}${ecValue < 12 ? ecValue : ecValue - 12}`,
			hc: hcValue,
			hcStr: `${hcPrefix}${hcValue < 12 ? hcValue : hcValue - 12}`,
		});
	}

	return returns;
}
