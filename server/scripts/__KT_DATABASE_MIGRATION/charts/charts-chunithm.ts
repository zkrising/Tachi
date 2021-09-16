/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "../migrate";
import CreateLogCtx from "lib/logger/logger";

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
		tierlistInfo: {},
		data: {
			inGameID: c.internals.inGameID,
		},
		isPrimary: true,
		versions: [], // sentinel
	};

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.chunithm, "charts-chunithm", ConvertFn);

	process.exit(0);
})();
