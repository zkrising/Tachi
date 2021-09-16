/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import MigrateRecords from "../migrate";

const logger = CreateLogCtx(__filename);

function Get2DXTraSet(flags: any) {
	if (flags["All Scratch"]) {
		return "All Scratch";
	} else if (flags.Kiraku) {
		return "Kiraku";
	} else if (flags.Kichiku) {
		return "Kichiku";
	}

	return null;
}

async function ConvertFn(c: any): Promise<ChartDocument<"iidx:SP" | "iidx:DP"> | null> {
	const song = await db.songs.iidx.findOne({
		id: c.id,
	});

	if (!song) {
		logger.warn(`Cannot find song with ID ${c.id}?`);
		return null;
	}

	const newChartDoc: ChartDocument<"iidx:SP" | "iidx:DP"> = {
		rgcID: null,
		chartID: c.chartID,
		difficulty: c.difficulty,
		songID: c.id,
		playtype: c.playtype,
		levelNum: c.levelNum,
		level: c.level.toString(),
		data: {
			inGameID: c.internals.inGameINTID,
			notecount: c.notedata.notecount,
			arcChartID: null,
			hashSHA256: c.internals.checksum2DXtra,
			"2dxtraSet": Get2DXTraSet(c.flags),
		},
		isPrimary: true,
		tierlistInfo: {},
		versions: [], // handled by scripts/single-use/fix-iidx-versions atm
	};

	return newChartDoc;
}

(async () => {
	await MigrateRecords(db.charts.iidx, "charts-iidx", ConvertFn);

	process.exit(0);
})();
