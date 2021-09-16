/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import MigrateRecords from "../migrate";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ChartDocument<"sdvx:Single">> {
	const song = await db.songs.sdvx.findOne({
		id: c.id,
	});

	if (!song) {
		logger.severe(`Cannot find song with ID ${c.id}?`);
		throw new Error(`Cannot find song with ID ${c.id}?`);
	}

	const newChartDoc: ChartDocument<"sdvx:Single"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		data: {
			inGameID: c.internals.inGameINTID,
			arcChartID: null,
		},
		isPrimary: true,
		tierlistInfo: {},
		versions: ["vivid"],
	};

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.sdvx, "charts-sdvx", ConvertFn);

	process.exit(0);
})();
