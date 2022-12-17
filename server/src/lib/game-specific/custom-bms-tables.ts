import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { CreateSongMap } from "tachi-common";
import {
	GetFolderCharts,
	GetFolderNamesInOrder,
	GetFoldersFromTable,
	GetTableForIDGuaranteed,
} from "utils/folder";
import path from "path";
import type { BMSTableEntry, BMSTableHead } from "bms-table-loader";
import type { Request, Response } from "express-serve-static-core";
import type {
	ChartDocument,
	FolderDocument,
	Playtypes,
	TableDocument,
	integer,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

// Instead of just supporting existing tables, Tachi should also be able
// to emit its own, custom BMS tables. These may be dynamic.

/**
 * Convert a table in Tachi into a bms header.json and body.json.
 */
export async function TachiTableToBMSTableJSON(
	table: TableDocument
): Promise<Array<BMSTableEntry>> {
	const body: Array<BMSTableEntry> = [];

	const folders = await GetFoldersFromTable(table);

	// we have to iterate over these folders in the order the table document says
	// to
	// as bms tables are somewhat sensitive to being placed in the correct order.
	const folderMap = new Map<string, FolderDocument>();

	for (const folder of folders) {
		folderMap.set(folder.folderID, folder);
	}

	for (const folderID of table.folders) {
		const folder = folderMap.get(folderID);

		if (!folder) {
			logger.warn(
				`Table '${table.title}' refers to folder '${folderID}', yet no such folder exists in the db?`
			);
			continue;
		}

		// note: we have to do this in sync so that 'response' is in the correct
		// order.
		// eslint-disable-next-line no-await-in-loop
		const data = await GetFolderCharts(folder, {}, true);
		const charts = data.charts as Array<ChartDocument<"bms:7K">>;
		const songMap = CreateSongMap(data.songs);

		for (const chart of charts) {
			const song = songMap.get(chart.songID);

			// if we've got metadata to add...
			if (song) {
				body.push({
					level: folder.title,
					title: song.title,
					artist: song.artist,
					md5: chart.data.hashMD5,
				});
			} else {
				logger.warn(`BMS Chart md5=${chart.data.hashMD5} has no parent song.`);
				body.push({
					level: folder.title,
					md5: chart.data.hashMD5,
				});
			}
		}
	}

	return body;
}

export type TachiBMSTable = {
	playtype: Playtypes["bms"];
	urlName: string; // what do we call this in the url?
	tableName: string; // what should it be called in-game?
	symbol: string; // what symbol should this table have?
} & (
	| {
			forSpecificUser: true; // if this table is user-dependent
			// like, say, their rivals scores or something.
			// then the callbacks need to recieve that info.
			getLevelOrder: (userID: integer) => Promise<Array<string> | undefined>;
			getBody: (userID: integer) => Promise<Array<BMSTableEntry>>;
	  }
	| {
			forSpecificUser?: false;
			getLevelOrder: () => Promise<Array<string> | undefined>;
			getBody: () => Promise<Array<BMSTableEntry>>;
	  }
);

/**
 * Get an "absolute URL" for this bms table. I.E.
 * https://example.com/api/v1/games/bms/7K/tables/exampleTable/header.json
 */
export function BMSTableToAbsoluteURL(
	bmsTable: TachiBMSTable,
	headerOrBody: "body" | "header",
	userID: number | null
) {
	return (
		ServerConfig.OUR_URL +
		path.join(
			"/api/v1/",

			// if this is a user-specific table, splice /users/$userID into this url.
			// (otherwise, don't do anything)
			bmsTable.forSpecificUser === true ? `/users/${userID}` : "",

			`games/bms/${bmsTable.playtype}/custom-tables/`,
			bmsTable.urlName,
			`${headerOrBody}.json`
		)
	);
}

function GetUserID(req: Request) {
	if ("userID" in req.params) {
		return Number(req.params.userID);
	}

	throw new Error(`No userID in params here. Is this route mounted in the right place?`);
}

/**
 * Handle a request for a bms table. This endpoint should return "HTML" with the caveat
 * that atleast one of the lines should refer to a "bmstable" meta header.
 */
export function HandleBMSTableHTMLRequest(bmsTable: TachiBMSTable, req: Request, res: Response) {
	let absURL;

	if (bmsTable.forSpecificUser === true) {
		const userID = GetUserID(req);

		absURL = BMSTableToAbsoluteURL(bmsTable, "header", userID);
	} else {
		absURL = BMSTableToAbsoluteURL(bmsTable, "header", null);
	}

	return res.status(200).send(`<html>
	<head>
	<meta name="bmstable" content="${absURL}">
	</head>
	<body>This is a stub page for the ${bmsTable.tableName} table. <a href="/">Go Home?</a></body>
	</html>`);
}

/**
 * Handle a request for a bms table's header.json.
 */
export async function HandleBMSTableHeaderRequest(
	bmsTable: TachiBMSTable,
	req: Request,
	res: Response
) {
	try {
		let levelOrder;
		let dataUrl;

		if (bmsTable.forSpecificUser === true) {
			const userID = GetUserID(req);

			dataUrl = BMSTableToAbsoluteURL(bmsTable, "body", userID);

			levelOrder = await bmsTable.getLevelOrder(userID);
		} else {
			levelOrder = await bmsTable.getLevelOrder();
			dataUrl = BMSTableToAbsoluteURL(bmsTable, "body", null);
		}

		const header: BMSTableHead = {
			data_url: dataUrl,
			name: bmsTable.tableName,
			symbol: bmsTable.symbol,
			levels: levelOrder,
		};

		return res.status(200).send(header);
	} catch (err) {
		logger.error(`Failed to load header.json for table ${bmsTable.tableName}.`, {
			bmsTable,
			err,
		});
		return res.status(500).send("Internal Server Error. Sorry about that.");
	}
}

export async function HandleBMSTableBodyRequest(
	bmsTable: TachiBMSTable,
	req: Request,
	res: Response
) {
	try {
		let body;

		if (bmsTable.forSpecificUser === true) {
			const userID = GetUserID(req);

			body = await bmsTable.getBody(userID);
		} else {
			body = await bmsTable.getBody();
		}

		return res.status(200).send(body);
	} catch (err) {
		logger.error(`Failed to load body.json for table ${bmsTable.tableName}.`, {
			bmsTable,
			err,
		});
		return res.status(500).send("Internal Server Error. Sorry about that.");
	}
}

/**
 * What custom tables does Tachi have?
 *
 * Adding a custom table here will just straight up add it to the site. Simple.
 */
export const CUSTOM_TACHI_BMS_TABLES: Array<TachiBMSTable> = [
	{
		urlName: "sieglindeEC",
		playtype: "7K",
		symbol: "sgl-",
		tableName: "Sieglinde EC",
		async getBody() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-EC");

			return TachiTableToBMSTableJSON(table);
		},
		async getLevelOrder() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-EC");

			return GetFolderNamesInOrder(table);
		},
	},
	{
		urlName: "sieglindeHC",
		playtype: "7K",
		symbol: "sgl-",
		tableName: "Sieglinde HC",
		async getBody() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-HC");

			return TachiTableToBMSTableJSON(table);
		},
		async getLevelOrder() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-HC");

			return GetFolderNamesInOrder(table);
		},
	},
];
