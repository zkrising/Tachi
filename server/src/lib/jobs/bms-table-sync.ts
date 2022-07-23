/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import { BMS_TABLES } from "tachi-common";
import { CreateFolderID, InitaliseFolderChartLookup } from "utils/folder";
import { FormatBMSTables } from "utils/misc";
import type { BMSTableInfo, ChartDocument } from "tachi-common";

// this seems to be all we care about
interface TableJSONDoc {
	md5: string;
	title?: string;
	level: string;
}

const logger = CreateLogCtx(__filename);

async function ImportTableLevels(tableJSON: Array<TableJSONDoc>, prefix: string) {
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

interface BMSTableChart {
	title: string;
	artist: string;
	url: string;
	url_diff: string;
	md5: string;
	sha256: string;
	level: string;
}

const RETRY_COUNT = 3;

export async function UpdateTable(table: BMSTableInfo) {
	const res = await fetch(table.url);

	const statusCode = res.status;

	let retries = 0;

	// instead of using res.json() we have to use res.text() here
	// so we have proper logging when some of these bms urls
	// spontaneously return HTML.
	let tableJSON: Array<BMSTableChart> | undefined;

	// We need to have a retry counter because some of the bms tables
	// randomly return useless html for no reason.

	// i hate bms.
	while (!tableJSON) {
		let text;

		try {
			text = await res.text();

			// @hack -- this is a force cast.
			tableJSON = JSON.parse(text) as unknown as Array<BMSTableChart>;
		} catch (err) {
			logger.error(`Failed to fetch ${table.url}`, { err, res, statusCode, text });
			retries++;

			if (retries > RETRY_COUNT) {
				logger.error(`SKIPPING TABLE!`);
				return;
			}

			logger.info(`Retrying ${table.url}.`);
		}
	}

	const tableID = `bms-${table.playtype}-${table.asciiPrefix}`;

	const folderIDs = [];
	const levels = [...new Set(tableJSON.map((e) => e.level))];

	for (const level of levels) {
		const query = {
			"data¬tableFolders": {
				"~elemMatch": {
					table: table.prefix,

					// just incase some dude tries numbers
					level: level.toString(),
				},
			},
		};

		const folderID = CreateFolderID(query, "bms", table.playtype);

		folderIDs.push(folderID);

		const exists = await db.folders.findOne({
			folderID,
		});

		if (exists) {
			continue;
		}

		await db.folders.insert({
			title: `${table.prefix}${level}`,
			inactive: false,
			folderID,
			game: "bms",
			playtype: table.playtype,
			type: "charts",
			data: query,
			searchTerms: [`${table.name} ${level}`],
		});

		logger.info(`Inserted new folder ${table.prefix}${level}.`);
	}

	await db.tables.update(
		{ tableID },
		{
			$set: {
				tableID,
				game: "bms",
				playtype: table.playtype,
				folders: folderIDs,
				title: table.name,
				description: table.description,
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

	logger.info(`Bumped table ${table.name}.`);

	logger.info(`Checking meta-folder...`);

	const metaQuery = {
		"data¬tableFolders¬table": table.prefix,
	};

	const folderID = CreateFolderID(metaQuery, "bms", table.playtype);

	folderIDs.push(folderID);

	const exists = await db.folders.findOne({
		folderID,
	});

	if (!exists) {
		await db.folders.insert({
			title: `${table.name}`,
			inactive: false,
			folderID,
			game: "bms",
			playtype: table.playtype,
			type: "charts",
			data: metaQuery,
			searchTerms: [table.asciiPrefix],
		});

		await db.tables.update(
			{
				tableID: `bms-${table.playtype}-meta`,
			},
			{
				$push: {
					folders: folderID,
				},
			}
		);

		logger.info(`Inserted meta folder for ${table.name}.`);
	}

	logger.info(`Bumping levels...`);
	await ImportTableLevels(tableJSON, table.prefix);
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
