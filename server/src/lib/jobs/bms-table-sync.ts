/* eslint-disable no-await-in-loop */
import { LoadBMSTable } from "bms-table-loader";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { DeorphanIfInQueue } from "lib/orphan-queue/orphan-queue";
import { BMS_TABLES } from "tachi-common";
import { InitaliseFolderChartLookup } from "utils/folder";
import { FormatBMSTables } from "utils/misc";
import type { BMSTableEntry } from "bms-table-loader";
import type { BMSTableInfo, ChartDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

async function ImportTableLevels(
	tableJSON: Array<BMSTableEntry>,
	prefix: string,
	playtype: "7K" | "14K"
) {
	let failures = 0;
	let success = 0;
	const total = tableJSON.length;

	for (const td of tableJSON) {
		let chart = (await db.charts.bms.findOne({ "data.hashMD5": td.md5 })) as ChartDocument<
			"bms:7K" | "bms:14K"
		> | null;

		if (!chart) {
			// didn't find it in the DB?
			// try and find it in the BMS orphan-queue
			chart = await DeorphanIfInQueue(`bms:${playtype}`, "bms", {
				"chartDoc.data.hashMD5": td.md5,
			});

			if (!chart) {
				logger.warn(
					`No chart exists in table for ${td.md5} Possible title: ${td.title} ${prefix}${td.level}`
				);
				failures++;
				continue;
			}
		}

		const tableFolders = chart.data.tableFolders.filter((e) => e.table !== prefix);

		tableFolders.push({ table: prefix, level: td.level.toString() });

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

		await db.songs.bms.update(
			{
				id: chart.songID,
			},
			{
				$set: {
					"data.tableString": FormatBMSTables(tableFolders),
				},
			}
		);

		success++;
	}

	logger.info(`Finished updating table ${prefix}.`);
	logger.info(`${success} Success | ${failures} Failures | ${total} Total.`);
}

export async function UpdateTable(tableInfo: BMSTableInfo) {
	const table = await LoadBMSTable(tableInfo.url);

	logger.info(`Bumping levels...`);
	await ImportTableLevels(table.body, tableInfo.prefix, tableInfo.playtype);
	logger.info(`Levels bumped.`);
}

export async function SyncBMSTables() {
	for (const table of BMS_TABLES) {
		// eslint-disable-next-line no-await-in-loop
		await UpdateTable(table);
	}

	logger.info(`Re-initialising folder-chart-lookup, since changes may have been made.`);
	await InitaliseFolderChartLookup();
	logger.info(`Done.`);
}

if (require.main === module) {
	SyncBMSTables()
		.then(() => process.exit(0))
		.catch((err: unknown) => {
			logger.error(`Failed to sync BMS Tables.`, { err }, () => {
				process.exit(1);
			});
		});
}
