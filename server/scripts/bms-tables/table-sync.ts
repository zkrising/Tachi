/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ChartDocument } from "tachi-common";
import fetch from "node-fetch";

// this seems to be all we care about
interface TableJSONDoc {
	md5: string;
	title?: string;
	level: string;
}

const logger = CreateLogCtx(__filename);

async function ImportTableLevels(tableJSON: TableJSONDoc[], prefix: string) {
	let failures = 0;
	let success = 0;
	const total = tableJSON.length;

	for (const td of tableJSON) {
		const chart = (await db.charts.bms.findOne({ "data.hashMD5": td.md5 })) as ChartDocument<
			"bms:7K" | "bms:14K"
		>;

		if (!chart) {
			logger.warn(
				`No chart exists in table fro ${td.md5} Possible title: ${td.title} ${prefix}${td.level}`
			);
			failures++;
			continue;
		}

		const tableFolders = chart.data.tableFolders.filter((e) => e.table !== prefix);

		tableFolders.push({ table: prefix, level: td.level });

		await db.charts.bms.update(
			{
				chartID: chart.chartID,
			},
			{
				$set: {
					"data.tableFolders": tableFolders,
				},
			}
		);

		success++;
	}

	logger.info(`Finished updating table ${prefix}.`);
	logger.info(`${success} Success | ${failures} Failures | ${total} Total.`);
}

export async function UpdateTable(prefix: string, url: string) {
	const tableJSON = await fetch(url).then((r) => r.json());

	return ImportTableLevels(tableJSON, prefix);
}
