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

/**
 * Tables might have updates that remove charts from their table.
 *
 * We need to handle this -- infact, it's quite common for something
 * to go from the sl12 folder to st0 -- which is a cross-table
 * change.
 */
async function HandleTableRemovals(tableJSON: Array<BMSTableEntry>, prefix: string) {
	// There are two ways to approach this, we could wipe the table
	// and then just apply the update. That is easy enough, but
	// leaves us in a temporary* invalid state for a while.

	// *unless this script  crashes, in which case it's
	// no longer temporary

	// garbage cast:
	// @todo, make these collections actually return the type they
	// should.
	const existingMD5s = (await db.charts.bms.find(
		{
			"data.tableFolders.table": prefix,
		},
		{
			projection: {
				"data.hashMD5": 1,
			},
		}
	)) as unknown as Array<ChartDocument<"bms:7K" | "bms:14K">>;

	// As such, the easiest way to handle this is to disjoint
	// the current md5s in the table against the md5s in the new
	// table. If the existing md5set doesn't exist in the new
	// table, we need to pull it.

	const newTableMD5s = new Set(...tableJSON.map((e) => e.md5));

	const toRemove: Array<string> = [];

	for (const md5 of existingMD5s.map((e) => e.data.hashMD5)) {
		if (!newTableMD5s.has(md5)) {
			toRemove.push(md5);
		}
	}

	if (toRemove.length === 0) {
		return;
	}

	logger.info(`Removing ${toRemove} chart(s) from ${prefix}.`);

	// pull this md5's table info
	await db.charts.bms.update(
		{
			"data.hashMD5": { $in: toRemove },
		},
		{
			$pull: {
				"data.tableFolders.table": prefix,
			},
		}
	);
}

async function ImportTableLevels(
	tableJSON: Array<BMSTableEntry>,
	prefix: string,
	playtype: "7K" | "14K"
) {
	let failures = 0;
	let success = 0;
	const total = tableJSON.length;

	logger.info(`Handling removals for ${prefix}...`);
	await HandleTableRemovals(tableJSON, prefix);

	await db.charts.bms.update(
		{
			"data.hashMD5": { $in: tableJSON.map((e) => e.md5) },
		},
		{
			$pull: {
				"tableFolders.table": prefix,
			},
		}
	);

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
