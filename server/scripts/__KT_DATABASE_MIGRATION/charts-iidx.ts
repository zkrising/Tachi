import { ChartDocument } from "kamaitachi-common";
import db from "../../src/db/db";
import { rootLogger } from "../../src/logger";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): ChartDocument<"iidx:SP" | "iidx:DP"> {
    const newChartDoc: ChartDocument<"iidx:SP" | "iidx:DP"> = {
        rgcID: null,
        chartID: c.chartID,
        difficulty: c.difficulty,
        songID: c.id,
        playtype: c.playtype,
        levelNum: c.levelNum,
        isRemoved: false,
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
    };

    if (typeof c.length === "number") {
        let m = Math.floor(c.length / 60_000);
        let s = c.length - m * 60_000;

        newChartDoc.length = `${m}:${s}`;
    }

    if (c.monoBPM) {
        newChartDoc.bpmString = c.bpmMin.toString();
    } else {
        newChartDoc.bpmString = `${c.bpmMin}-${c.bpmMax}`;
    }

    if (newChartDoc.length === null) {
        rootLogger.warn(`Length of chart ${newChartDoc.chartID} is null, continuing anyway?`);
    }

    return newChartDoc;
}

(async () => {
    await MigrateRecords(db.charts.iidx, "charts-iidx", ConvertFn);

    process.exit(0);
})();
