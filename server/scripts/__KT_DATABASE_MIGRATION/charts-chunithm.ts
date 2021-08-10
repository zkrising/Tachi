/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChartDocument } from "tachi-common";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/common/logger";
import MigrateRecords from "./migrate";
import { gameOrders } from "tachi-common/js/config";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ChartDocument<"chunithm:Single">> {
	const song = await db.songs.chunithm.findOne({
		id: c.id,
	});

	if (!song) {
		logger.severe(`Cannot find song with ID ${c.id}?`);
		throw new Error(`Cannot find song with ID ${c.id}?`);
	}

	const newChartDoc: ChartDocument<"chunithm:Single"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		flags: {
			"IN BASE GAME": !!c.flags["IN BASE GAME"],
			OMNIMIX: !!c.flags.OMNIMIX,
		},
		data: {
			inGameID: c.internals.inGameID,
		},
		isPrimary: true,
		versions: [], // sentinel
	};

	const idx = gameOrders.chunithm.indexOf(song.firstVersion!);

	if (idx === -1) {
		logger.warn(`Invalid firstAppearance of ${song.firstVersion!}, running anyway.`);
		newChartDoc.versions = [song.firstVersion!];
	} else {
		newChartDoc.versions = gameOrders.chunithm.slice(idx);
	}

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.chunithm, "charts-chunithm", ConvertFn);

	process.exit(0);
})();
