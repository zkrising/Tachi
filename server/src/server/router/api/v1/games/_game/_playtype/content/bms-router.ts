import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateSongMap } from "tachi-common";
import { GetFolderCharts, GetFoldersFromTable } from "utils/folder";
import type { Request, Response } from "express";
import type { ChartDocument } from "tachi-common/types";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Utility function for mounting a BMS-style Table. This defines
 * a header.json endpoint, and a body.json endpoint.
 *
 * It also defines a HTML-emitting endpoint that contains a pointer
 * to said header.json file.
 */
function CreateAndMountTable(
	router: Router,
	tableName: string,
	headerHandler: (req: Request, res: Response) => unknown,
	bodyHandler: (req: Request, res: Response) => unknown
) {
	router.get(`/${tableName}`, (req, res) => {
		return res.status(200).send(`<html>
		<head>
		<meta name="bmstable" value="./header.json">
		</head>
		<body>This is a stub page for the ${tableName} table. <a href="/">Go Home?</a></body>
		</html>`);
	});

	router.get(`/${tableName}/header.json`, headerHandler);

	router.get(`/${tableName}/body.json`, bodyHandler);
}

/**
 * Returns a difficulty table of all charts rated according to their Sieglinde values for easy clears
 *
 * @name GET /api/v1/games/bms/7k/content/sieglindeEC
 */
CreateAndMountTable(
	router,
	"sieglindeEC",
	/* header.json */ (_req, res) => {
		return res.status(200).send({
			name: "Sieglinde EC",
			symbol: "sgl-",
			data_url: "./body.json",
		});
	},
	/* body.json */ async (req, res) => {
		const game = "bms";

		const table = await db.tables.findOne({
			tableID: "bms-7K-sgl-EC",
			game,
			playtype: "7K",
		});

		if (!table) {
			logger.error(
				"Could not find table bms-7K-sgl-EC. Cannot convert sieglinde tables into BMS form!"
			);
			return res.status(500).json([]);
		}

		const folders = await GetFoldersFromTable(table);
		const response = [];

		for (const folder of folders) {
			const data = await GetFolderCharts(folder, {}, true);
			const charts = data.charts as Array<ChartDocument<"bms:7K">>;
			const songMap = CreateSongMap(data.songs);

			for (const chart of charts) {
				const song = songMap.get(chart.songID);

				if (!song) {
					response.push({
						level: folder.title,
						md5: chart.data.hashMD5,
					});
				} else {
					response.push({
						level: folder.title,
						title: song.title,
						artist: song.artist,
						md5: chart.data.hashMD5,
					});
				}
			}
		}

		return res.status(200).json(response);
	}
);

/**
 * Returns a difficulty table of all charts rated according to their Sieglinde values for hard clears
 *
 * @name GET /api/v1/games/bms/7k/content/sieglindeHC
 */
CreateAndMountTable(
	router,
	"sieglindeHC",
	/* header.json */ (_req, res) => {
		return res.status(200).send({
			name: "Sieglinde HC",
			symbol: "sgl-",
			data_url: "./body.json",
		});
	},
	/* body.json */ async (req, res) => {
		const game = "bms";

		const table = await db.tables.findOne({
			tableID: "bms-7K-sgl-HC",
			game,
			playtype: "7K",
		});

		if (!table) {
			logger.error(
				"Could not find table bms-7K-sgl-HC. Cannot convert sieglinde tables into BMS form!"
			);
			return res.status(500).json([]);
		}

		const folders = await GetFoldersFromTable(table);
		const response = [];

		for (const folder of folders) {
			const data = await GetFolderCharts(folder, {}, true);
			const charts = data.charts as Array<ChartDocument<"bms:7K">>;
			const songMap = CreateSongMap(data.songs);

			for (const chart of charts) {
				const song = songMap.get(chart.songID);

				if (!song) {
					response.push({
						level: folder.title,
						md5: chart.data.hashMD5,
					});
				} else {
					response.push({
						level: folder.title,
						title: song.title,
						artist: song.artist,
						md5: chart.data.hashMD5,
					});
				}
			}
		}

		return res.status(200).json(response);
	}
);

export default router;
