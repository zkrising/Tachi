import CreateLogCtx from "lib/logger/logger";
import { GetRivalUsers } from "lib/rivals/rivals";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { CreateSongMap } from "tachi-common";
import { GetRelevantSongsAndCharts } from "utils/db";
import {
	GetFolderCharts,
	GetFolderNamesInOrder,
	GetFoldersFromTable,
	GetTableForIDGuaranteed,
} from "utils/folder";
import { GetRecentUGPTScores } from "utils/queries/scores";
import { GetUser } from "utils/req-tachi-data";
import path from "path";
import type { BMSTableEntry, BMSTableHead } from "bms-table-loader";
import type { Request, Response } from "express-serve-static-core";
import type {
	ChartDocument,
	FolderDocument,
	Playtypes,
	SongDocument,
	TableDocument,
	integer,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

// Instead of just supporting existing tables, Tachi should also be able
// to emit its own, custom BMS tables. These may be dynamic.

function AppendAndConvertChartsToBMSBody(
	body: Array<BMSTableEntry>,
	charts: Array<ChartDocument<"bms:7K" | "bms:14K">>,
	songMap: Map<integer, SongDocument>,
	level: string
) {
	for (const chart of charts) {
		const song = songMap.get(chart.songID);

		// if we've got metadata to add...
		if (song) {
			body.push({
				level,
				title: song.title,
				artist: song.artist,
				md5: chart.data.hashMD5,
			});
		} else {
			logger.warn(`BMS Chart md5=${chart.data.hashMD5} has no parent song.`);
			body.push({
				level,
				md5: chart.data.hashMD5,
			});
		}
	}
}

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

		AppendAndConvertChartsToBMSBody(body, charts, songMap, folder.title);
	}

	return body;
}

export type TachiBMSTable = {
	playtype: Playtypes["bms"] | null; // what playtype is this for? If null, this table
	// is for all playtypes.

	urlName: string; // what do we call this in the url?
	tableName: string; // what should it be called in-game?
	symbol: string; // what symbol should this table have?
	description: string;
} & (
	| {
			forSpecificUser: true; // if this table is user-dependent
			// like, say, their rivals scores or something.
			// then the callbacks need to recieve that info.
			getLevelOrder: (
				userID: integer,
				playtype: Playtypes["bms"]
			) => Promise<Array<string> | undefined>;
			getBody: (userID: integer, playtype: Playtypes["bms"]) => Promise<Array<BMSTableEntry>>;
	  }
	| {
			forSpecificUser?: false;
			getLevelOrder: (playtype: Playtypes["bms"]) => Promise<Array<string> | undefined>;
			getBody: (playtype: Playtypes["bms"]) => Promise<Array<BMSTableEntry>>;
	  }
);

/**
 * Get an "absolute URL" for this bms table. I.E.
 * https://example.com/api/v1/games/bms/7K/tables/exampleTable/header.json
 */
export function BMSTableToAbsoluteURL(
	bmsTable: TachiBMSTable,
	playtype: Playtypes["bms"],
	headerOrBody: "body" | "header",
	userID: number | null
) {
	return (
		ServerConfig.OUR_URL +
		path.join(
			"/api/v1/",

			// if this is a user-specific table, splice /users/$userID into this url.
			// (otherwise, don't do anything)
			bmsTable.forSpecificUser === true ? `users/${userID}` : "",

			`games/bms/${playtype}/custom-tables/`,
			bmsTable.urlName,
			`${headerOrBody}.json`
		)
	);
}

function GetUserID(req: Request) {
	if ("userID" in req.params) {
		const user = GetUser(req);

		return user.id;
	}

	throw new Error(`No userID in params here. Is this route mounted in the right place?`);
}

function GetPlaytype(req: Request) {
	if ("playtype" in req.params) {
		return req.params.playtype as Playtypes["bms"];
	}

	throw new Error(`No playtype in params here. Is this route mounted in the right place?`);
}

/**
 * Handle a request for a bms table. This endpoint should return "HTML" with the caveat
 * that atleast one of the lines should refer to a "bmstable" meta header.
 */
export function HandleBMSTableHTMLRequest(bmsTable: TachiBMSTable, req: Request, res: Response) {
	let absURL;
	const playtype = GetPlaytype(req);

	if (bmsTable.forSpecificUser === true) {
		const userID = GetUserID(req);

		absURL = BMSTableToAbsoluteURL(bmsTable, playtype, "header", userID);
	} else {
		absURL = BMSTableToAbsoluteURL(bmsTable, playtype, "header", null);
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
		const playtype = GetPlaytype(req);

		if (bmsTable.forSpecificUser === true) {
			const userID = GetUserID(req);

			dataUrl = BMSTableToAbsoluteURL(bmsTable, playtype, "body", userID);

			levelOrder = await bmsTable.getLevelOrder(userID, playtype);
		} else {
			levelOrder = await bmsTable.getLevelOrder(playtype);
			dataUrl = BMSTableToAbsoluteURL(bmsTable, playtype, "body", null);
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

		const playtype = GetPlaytype(req);

		if (bmsTable.forSpecificUser === true) {
			const userID = GetUserID(req);

			body = await bmsTable.getBody(userID, playtype);
		} else {
			body = await bmsTable.getBody(playtype);
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
		description:
			"Folders for the 'Sieglinde' rating algorithm. These are rough estimates of how hard it is to EASY CLEAR a given chart.",
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
		description:
			"Folders for the 'Sieglinde' rating algorithm. These are rough estimates of how hard it is to HARD CLEAR a given chart.",
		async getBody() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-HC");

			return TachiTableToBMSTableJSON(table);
		},
		async getLevelOrder() {
			const table = await GetTableForIDGuaranteed("bms-7K-sgl-HC");

			return GetFolderNamesInOrder(table);
		},
	},

	{
		urlName: "rival-info",
		playtype: null,
		symbol: "Rival",
		tableName: `${TachiConfig.NAME} Rival Stats`,
		forSpecificUser: true,
		description: `Folders for your rivals on ${TachiConfig.NAME}. This includes things like their recent highlights and plays.`,
		async getBody(userID, playtype) {
			const rivals = await GetRivalUsers(userID, "bms", playtype);

			const body: Array<BMSTableEntry> = [];

			const promises = [];

			for (const rival of rivals) {
				promises.push(
					(async () => {
						const scores = await GetRecentUGPTScores(rival.id, "bms", playtype);

						const data = await GetRelevantSongsAndCharts(scores, "bms");
						const charts = data.charts as unknown as Array<
							ChartDocument<"bms:7K" | "bms:14K">
						>;

						const songMap = CreateSongMap(data.songs);

						AppendAndConvertChartsToBMSBody(
							body,
							charts,
							songMap,
							`${rival.username} Recent Plays`
						);
					})()
				);

				promises.push(
					(async () => {
						const scores = await GetRecentUGPTScores(rival.id, "bms", playtype);

						const data = await GetRelevantSongsAndCharts(scores, "bms");
						const charts = data.charts as unknown as Array<
							ChartDocument<"bms:7K" | "bms:14K">
						>;

						const songMap = CreateSongMap(data.songs);

						AppendAndConvertChartsToBMSBody(
							body,
							charts,
							songMap,
							`${rival.username} Recent Highlights`
						);
					})()
				);
			}

			await Promise.all(promises);

			return body;
		},
		async getLevelOrder(userID, playtype) {
			const rivals = await GetRivalUsers(userID, "bms", playtype);

			return rivals.flatMap((rival) => [
				`${rival.username} Recent Plays`,
				`${rival.username} Recent Highlights`,
			]);
		},
	},
];
