/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChartDocument, SongDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import MigrateRecords from "../migrate";
import { oldKTDB } from "../old-db";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ChartDocument<"ddr:SP" | "ddr:DP">> {
	const song = (await db.songs.ddr.findOne({
		id: c.id,
	})) as SongDocument<"ddr">;

	const oldSong = await oldKTDB.get("songs-ddr").findOne({
		id: c.id,
	});

	if (!song) {
		logger.severe(`Cannot find song with ID ${c.id}?`);
		throw new Error(`Cannot find song with ID ${c.id}?`);
	}

	const newChartDoc: ChartDocument<"ddr:SP" | "ddr:DP"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		data: {
			inGameID: c.internals.inGameID,
			songHash: oldSong.internals.songHash,
		},
		tierlistInfo: {},
		isPrimary: true,
		versions: [], // sentinel
	};

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.ddr, "charts-ddr", ConvertFn);

	process.exit(0);
})();
