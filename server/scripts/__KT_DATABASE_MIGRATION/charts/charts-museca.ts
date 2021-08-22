/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import MigrateRecords from "../migrate";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ChartDocument<"museca:Single"> | null> {
	const song = await db.songs.museca.findOne({
		id: c.id,
	});

	// this is a warn instead of severe because some songs have charts but no songs
	// presumably removed stuff like brain power?
	if (!song) {
		logger.warn(`Cannot find song with ID ${c.id}?`);
		return null;
	}

	const newChartDoc: ChartDocument<"museca:Single"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		// for our kt1 dataset, inGameID *is* song id.
		data: { inGameID: c.id },
		isPrimary: true,
		versions: ["1+1/2"],
	};

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.museca, "charts-museca", ConvertFn);

	process.exit(0);
})();
