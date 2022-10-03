/* eslint-disable no-await-in-loop */
import { LoadBMSTable } from "bms-table-loader";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { BMS_TABLES } from "tachi-common";
import { CreateFolderID, InitaliseFolderChartLookup } from "utils/folder";
import { FormatBMSTables } from "utils/misc";
import type { BMSTableEntry } from "bms-table-loader";
import type { BMSTableInfo, ChartDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

async function ImportTableLevels(tableJSON: Array<BMSTableEntry>, prefix: string) {
	let failures = 0;
	let success = 0;
	const total = tableJSON.length;

	for (const td of tableJSON) {
		const chart = (await db.charts.bms.findOne({ "data.hashMD5": td.md5 })) as ChartDocument<
			"bms:7K" | "bms:14K"
		> | null;

		if (!chart) {
			logger.warn(
				`No chart exists in table for ${td.md5} Possible title: ${td.title} ${prefix}${td.level}`
			);
			failures++;
			continue;
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

	const tableID = `bms-${tableInfo.playtype}-${tableInfo.asciiPrefix}`;

	const folderIDs = [];
	const levels = table.getLevelOrder();

	for (const level of levels) {
		const query = {
			"data¬tableFolders": {
				"~elemMatch": {
					table: tableInfo.prefix,

					// just incase some dude tries numbers
					level: level.toString(),
				},
			},
		};

		const folderID = CreateFolderID(query, "bms", tableInfo.playtype);

		folderIDs.push(folderID);

		const exists = await db.folders.findOne({
			folderID,
		});

		if (exists) {
			continue;
		}

		await db.folders.insert({
			title: `${tableInfo.prefix}${level}`,
			inactive: false,
			folderID,
			game: "bms",
			playtype: tableInfo.playtype,
			type: "charts",
			data: query,
			searchTerms: [`${tableInfo.name} ${level}`],
		});

		logger.info(`Inserted new folder ${tableInfo.prefix}${level}.`);
	}

	await db.tables.update(
		{ tableID },
		{
			$set: {
				tableID,
				game: "bms",
				playtype: tableInfo.playtype,
				folders: folderIDs,
				title: tableInfo.name,
				description: tableInfo.description,
				inactive: false,
			},
			$setOnInsert: {
				default: false,
			},
		},
		{
			upsert: true,
		}
	);

	logger.info(`Bumped table ${tableInfo.name}.`);

	logger.info(`Checking meta-folder...`);

	const metaQuery = {
		"data¬tableFolders¬table": tableInfo.prefix,
	};

	const folderID = CreateFolderID(metaQuery, "bms", tableInfo.playtype);

	folderIDs.push(folderID);

	const exists = await db.folders.findOne({
		folderID,
	});

	if (!exists) {
		await db.folders.insert({
			title: `${tableInfo.name}`,
			inactive: false,
			folderID,
			game: "bms",
			playtype: tableInfo.playtype,
			type: "charts",
			data: metaQuery,
			searchTerms: [tableInfo.asciiPrefix],
		});

		await db.tables.update(
			{
				tableID: `bms-${tableInfo.playtype}-meta`,
			},
			{
				$push: {
					folders: folderID,
				},
			}
		);

		logger.info(`Inserted meta folder for ${tableInfo.name}.`);
	}

	logger.info(`Bumping levels...`);
	await ImportTableLevels(table.body, tableInfo.prefix);
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
