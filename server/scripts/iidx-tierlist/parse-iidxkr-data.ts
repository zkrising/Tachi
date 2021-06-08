import db from "../../src/db/db";
import fs from "fs";
import path from "path";
import { CalculateTierlistDataID } from "../../src/common/tierlist";
import { FindSongOnTitle } from "../../src/common/database-lookup/song";
import CreateLogCtx from "../../src/common/logger";
import { FindChartWithPTDF } from "../../src/common/database-lookup/chart";
import { Difficulties } from "tachi-common";

const logger = CreateLogCtx(__filename);

const TIERLIST_ID = "ee9b756e50cff8282091102257b01f423ef855f2";

async function parseKr(
    dir: string,
    key: "NORMAL CLEAR" | "HARD CLEAR",
    catVals: { h: string; v: number }[]
) {
    const krdata = JSON.parse(fs.readFileSync(path.join(__dirname, "./iidx-pe-kr", dir), "utf-8"));

    const tdd = [];

    for (let i = 0; i < krdata.categories.length; i++) {
        const data = krdata.categories[i];
        if (data.sortindex < 0) {
            continue;
        }

        const cv = catVals[i];

        if (!cv) {
            throw new Error(`cv krdata mismatch ${krdata.categories.length} ${catVals.length}?`);
        }

        for (const item of data.items) {
            const song = await FindSongOnTitle("iidx", item.data.title.replace(/†$/u, "").trim());

            if (!song) {
                logger.warn(`Could not find song with title ${item.data.title}`);
                continue;
            }

            const t = item.data.type;

            let diff: Difficulties["iidx:SP"];
            if (t === "A") {
                diff = "ANOTHER";
            } else if (t === "L") {
                diff = "LEGGENDARIA";
            } else if (t === "H") {
                diff = "HYPER";
            } else if (t === "N") {
                diff = "NORMAL";
            } else {
                logger.warn(`${song.title} Unknown difficulty ${t}.`);
                continue;
            }

            const chart = await FindChartWithPTDF("iidx", song.id, "SP", diff);

            if (!chart) {
                logger.warn(`${song.title} ${diff} - Couldn't find chart?`);
                continue;
            }

            tdd.push({
                chartID: chart.chartID,
                type: "lamp" as const,
                tierlistID: TIERLIST_ID,
                tierlistDataID: CalculateTierlistDataID(chart.chartID, "lamp", key, TIERLIST_ID),
                key,
                data: {
                    humanised: cv.h,
                    value: cv.v,
                    flags: {
                        "Individual Difference": !!data.category.match(/個人差/u),
                    },
                },
            });
        }
    }

    logger.info(`Inserting ${tdd.length} documents...`);

    const x = await db["tierlist-data"].bulkWrite(
        tdd.map((e) => ({
            updateOne: {
                filter: {
                    tierlistDataID: e.tierlistDataID,
                },
                update: {
                    $set: e,
                },
                upsert: true,
            },
        }))
    );

    logger.info(x);

    logger.info("done...");
}

function h(h: string, v: number) {
    return { h, v };
}

parseKr("sp9H.json", "HARD CLEAR", [
    h("S+", 10.2),
    h("S", 10),
    h("S 個人差", 10),
    h("A+", 9.9),
    h("A+ 個人差", 9.9),
    h("A", 9.8),
    h("B+", 9.7),
    h("B", 9.6),
    h("C+", 9.5),
    h("C", 9.4),
    h("D", 9.2),
    h("E", 9.0),
    h("F", 8.8),
]);

parseKr("sp10H.json", "HARD CLEAR", [
    h("S", 11),
    h("A+", 10.9),
    h("A", 10.8),
    h("B+", 10.7),
    h("B", 10.6),
    h("C+", 10.5),
    h("C", 10.4),
    h("D", 10.2),
    h("E", 10.0),
    h("F", 9.8),
]);

parseKr("sp11N.json", "NORMAL CLEAR", [
    h("S+", 12.2),
    h("S", 12),
    h("A+", 11.9),
    h("A", 11.8),
    h("B", 11.6),
    h("C", 11.4),
    h("D", 11.2),
    h("E", 11.0),
    h("F", 10.8),
]);

parseKr("sp11H.json", "HARD CLEAR", [
    h("S+", 12.2),
    h("S+ 個人差", 12.2),
    h("S", 12),
    h("S 個人差", 12),
    h("A+", 11.9),
    h("A+ 個人差", 11.9),
    h("A", 11.8),
    h("A 個人差", 11.0),
    h("B+", 11.7),
    h("B", 11.6),
    h("C", 11.4),
    h("D", 11.2),
    h("E", 11.0),
    h("F", 10.8),
]);
