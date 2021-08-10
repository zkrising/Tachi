/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartDocument, SongDocument } from "tachi-common";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/common/logger";
import MigrateRecords from "./migrate";
import { gameOrders } from "tachi-common/js/config";
import { oldKTDB } from "./old-db";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ChartDocument<"gitadora:Gita" | "gitadora:Dora">> {
	const song = (await db.songs.gitadora.findOne({
		id: c.id,
	})) as SongDocument<"gitadora">;

	const oldSong = await oldKTDB.get("songs-gitadora").findOne({
		id: c.id,
	});

	if (!song) {
		logger.severe(`Cannot find song with ID ${c.id}?`);
		throw new Error(`Cannot find song with ID ${c.id}?`);
	}

	const newChartDoc: ChartDocument<"gitadora:Gita" | "gitadora:Dora"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		flags: {
			"IN BASE GAME": true,
			OMNIMIX: true,
		},
		data: {
			inGameID: c.internals.inGameINTID,
		},
		isPrimary: true,
		versions: [], // sentinel
	};

	const idx = gameOrders.gitadora.indexOf(song.firstVersion!);

	if (idx === -1) {
		logger.warn(`Invalid firstAppearance of ${song.firstVersion!}, running anyway.`);
		newChartDoc.versions = [song.firstVersion!];
	} else {
		newChartDoc.versions = gameOrders.gitadora.slice(idx);
	}

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.gitadora, "charts-gitadora", ConvertFn);

	process.exit(0);
})();
