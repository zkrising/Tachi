import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetFolderCharts, GetFoldersFromTable } from "utils/folder";
import { GetTachiData } from "utils/req-tachi-data";
import type { Request, Response } from "express";
import type { ChartDocument } from "tachi-common/types";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });


/**
 * Returns "Endpoint exists"
 *
 * @name GET /api/v1/games/bms/7K/content
 */
router.get("/", (req, res) => {
	return res.status(200).json({
		success: true,
		description: "Endpoint exists",
	});
});

function CreateAndMountTable(
	router: Router,
	tableName: string,
	headerHandler: (req: Request, res: Response) => any,
	bodyHandler: (req: Request, res: Response) => any
) {
	router.get(`/${tableName}`, (req, res) => {
		return res.status(200).send(`<html>
		<head>
		<meta name="bmstable" value="./${tableName}/header.json">
		</head>
		<body>This is a stub page for beatoraja compatibility. No useful information here!</body>
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
	/* header.json */(_req, res) => {
		return res.status(200).send({
			name: "Sieglinde EC",
			symbol: "sgl-",
			data_url: "./body.json",
		});
	},
	/* body.json */ async (req, res) => {
		const game = GetTachiData(req, "game");
		const table = await db.tables.findOne({
			tableID: "bms-7K-sgl-EC",
			game,
			playtype: "7K",
		});

		if (!table) {
			logger.error("Could not find table bms-7K-sgl-EC (even though it should be there...)");
			return res.status(500).json([]);
		}

		const folders = await GetFoldersFromTable(table);
		const response = [];

		for (const folder of folders) {
			const data = await GetFolderCharts(folder, {}, true);
			const charts = data.charts as Array<ChartDocument<"bms:7K">>;
			const songs = data.songs;

			for (const chart of charts) {
				const song = songs.find((song) => song.id === chart.songID);

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
	/* header.json */(_req, res) => {
		return res.status(200).send({
			name: "Sieglinde HC",
			symbol: "sgl-",
			data_url: "./body.json",
		});
	},
	/* body.json */ async (req, res) => {
		const game = GetTachiData(req, "game");
		const table = await db.tables.findOne({
			tableID: "bms-7K-sgl-HC",
			game,
			playtype: "7K",
		});

		if (!table) {
			logger.error("Could not find table bms-7K-sgl-HC (even though it should be there...)");
			return res.status(500).json([]);
		}

		const folders = await GetFoldersFromTable(table);
		const response = [];

		for (const folder of folders) {
			const data = await GetFolderCharts(folder, {}, true);
			const charts = data.charts as Array<ChartDocument<"bms:7K">>;
			const songs = data.songs;

			for (const chart of charts) {
				const song = songs.find((song) => song.id === chart.songID);

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
