/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { BMS_TABLES } from "lib/constants/bms-tables";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import { CreateFolderID, InitaliseFolderChartLookup } from "utils/folder";
import { FormatBMSTables } from "utils/misc";
import type { ChartDocument } from "tachi-common";

// I have no confidence in half of these links surviving.
// Eventually, some of these are going to disappear, and we'll have to find
// something else. probably.
const registeredTables: Array<BMSTablesDataset> = [
	{
		name: "Insane",
		humanisedPrefix: "insane",
		playtype: "7K",
		prefix: BMS_TABLES.insane,
		description: "The 7K GENOSIDE insane table.",
		url: "http://www.ribbit.xyz/bms/tables/insane_body.json",
	},
	{
		name: "Normal",
		humanisedPrefix: "normal",
		playtype: "7K",
		prefix: BMS_TABLES.normal,
		description: "The 7K GENOSIDE normal table.",
		url: "http://www.ribbit.xyz/bms/tables/normal_body.json",
	},
	{
		name: "Stella",
		humanisedPrefix: "st",
		playtype: "7K",
		prefix: BMS_TABLES.stella,
		description: "The stella table, from Stellaverse.",
		url: "https://stellabms.xyz/st/score.json",
	},
	{
		name: "Satellite",
		humanisedPrefix: "sl",
		playtype: "7K",
		prefix: BMS_TABLES.satellite,
		description: "The satellite table, from Stellaverse.",
		url: "https://stellabms.xyz/sl/score.json",
	},
	{
		name: "Insane2",
		humanisedPrefix: "insane2",
		playtype: "7K",
		prefix: BMS_TABLES.insane2,
		description: "A successor to the original insane table, but is generally less consistent.",
		url: "http://rattoto10.jounin.jp/js/insane_data.json",
	},
	{
		name: "Normal2",
		humanisedPrefix: "normal2",
		playtype: "7K",
		prefix: BMS_TABLES.normal2,
		description: "A successor to the original normal table.",
		url: "http://rattoto10.jounin.jp/js/score.json",
	},
	{
		name: "Overjoy",
		description: "The overjoy table. Level 1 is roughly equivalent to Insane 20.",
		humanisedPrefix: "overjoy",
		playtype: "7K",
		prefix: BMS_TABLES.overjoy,
		url: "http://lr2.sakura.ne.jp/data/score.json",
	},
	{
		name: "DP Insane",
		description: "The 14K Insane table.",
		humanisedPrefix: "dpInsane",
		prefix: BMS_TABLES.dpInsane,
		playtype: "14K",
		url: "http://dpbmsdelta.web.fc2.com/table/data/insane_data.json",
	},
	{
		name: "DP Normal",
		description: "The 14K Normal table, Sometimes called the delta table.",
		humanisedPrefix: "dpNormal",
		prefix: BMS_TABLES.dpNormal,
		playtype: "14K",
		url: "http://dpbmsdelta.web.fc2.com/table/data/dpdelta_data.json",
	},
	{
		name: "DP Satellite",
		description: "The 14K Satellite table.",
		humanisedPrefix: "dpSatellite",
		prefix: BMS_TABLES.satellite,
		playtype: "14K",
		url: "https://stellabms.xyz/dp/score.json",
	},
	{
		name: "Scratch 3rd",
		description: "The 7K Sara 3 table.",
		humanisedPrefix: "scr",
		prefix: BMS_TABLES.scratch,
		playtype: "7K",
		url: "http://minddnim.web.fc2.com/sara/3rd_hard/json/data.json",
	},
	{
		name: "LN",
		description: "The 7K LN table.",
		humanisedPrefix: "ln",
		prefix: BMS_TABLES.ln,
		playtype: "7K",
		url: "http://flowermaster.web.fc2.com/lrnanido/gla/score.json",
	},
];

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

export interface BMSTablesDataset {
	url: string;
	name: string;
	description: string;
	humanisedPrefix: string;
	prefix: string;
	playtype: "7K" | "14K";
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

export async function UpdateTable(table: BMSTablesDataset) {
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

	const tableID = `bms-${table.playtype}-${table.humanisedPrefix}`;

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

		logger.info(`Inserted new table ${table.prefix}${level}.`);
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
		},
		{
			upsert: true,
		}
	);

	logger.info(`Bumped table ${table.name}.`);

	logger.info(`Bumping levels...`);
	await ImportTableLevels(tableJSON, table.prefix);
	logger.info(`Levels bumped.`);
}

if (require.main === module) {
	(async () => {
		for (const table of registeredTables) {
			// eslint-disable-next-line no-await-in-loop
			await UpdateTable(table);
		}

		logger.info(`Re-initialising folder-chart-lookup, since changes may have been made.`);
		await InitaliseFolderChartLookup();
		logger.info(`Done.`);

		process.exit(0);
	})().catch((err: unknown) => {
		logger.error(`Failed to sync BMS Tables.`, { err });

		process.exit(1);
	});
}
