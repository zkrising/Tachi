import { ChartDocument } from "kamaitachi-common";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/logger";
import MigrateRecords from "./migrate";
import { gameOrders } from "kamaitachi-common/js/config";

const logger = CreateLogCtx("charts-iidx.ts");

async function ConvertFn(c: any): Promise<ChartDocument<"iidx:SP" | "iidx:DP">> {
    let song = await db.songs.iidx.findOne({
        id: c.id,
    });

    if (!song) {
        logger.severe(`Cannot find song with ID ${c.id}?`);
        throw new Error(`Cannot find song with ID ${c.id}?`);
    }

    const newChartDoc: ChartDocument<"iidx:SP" | "iidx:DP"> = {
        rgcID: null,
        chartID: c.chartID,
        difficulty: c.difficulty,
        songID: c.id,
        playtype: c.playtype,
        levelNum: c.levelNum,
        level: c.level.toString(),
        length: c.length,
        bpmString: "", // sentinel
        flags: {
            "IN BASE GAME": !!c.flags["IN BASE GAME"],
            OMNIMIX: !!c.flags.OMNIMIX,
            "N-1": !!c.flags["N-1"],
        },
        data: {
            inGameID: c.internals.inGameINTID,
            notecount: c.notedata.notecount,
        },
        isPrimary: true,
        versions: [], // sentinel
    };

    if (typeof c.length === "number") {
        let m = Math.floor(c.length / 60_000);
        let s = ((c.length - m * 60_000) / 1_000).toFixed(2);

        newChartDoc.length = `${m}:${s}`;
    }

    let idx = gameOrders.iidx.indexOf(song.firstVersion!);

    if (idx === -1) {
        logger.warn(`Invalid firstAppearance of ${song.firstVersion!}, running anyway.`);
        newChartDoc.versions = [song.firstVersion!];
    } else {
        newChartDoc.versions = gameOrders.iidx.slice(idx);
    }

    if (c.monoBPM) {
        newChartDoc.bpmString = c.bpmMin.toString();
    } else {
        newChartDoc.bpmString = `${c.bpmMin}-${c.bpmMax}`;
    }

    if (newChartDoc.length === null) {
        logger.warn(`Length of chart ${newChartDoc.chartID} is null, continuing anyway?`);
    }

    return newChartDoc;
}

(async () => {
    await MigrateRecords(db.charts.iidx, "charts-iidx", ConvertFn);

    process.exit(0);
})();
