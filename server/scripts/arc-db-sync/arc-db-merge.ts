import fs from "fs";
import { ICollection } from "monk";
import path from "path";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/logger";
import { FindChartWithPTDFVersion } from "../../src/score-import/database-lookup/chart-ptdf";
import { FindSongOnTitle } from "../../src/score-import/database-lookup/song-title";
import { ChartDocument } from "kamaitachi-common";

const logger = CreateLogCtx("arc-db-merge.ts");

async function MergeIDs() {
    let charts = JSON.parse(fs.readFileSync(path.join(__dirname, "./charts.json"), "utf-8"));

    for (const chartData of charts) {
        let songTitle = chartData._related.music[0].title;

        let song = await FindSongOnTitle("iidx", songTitle);

        if (!song) {
            logger.error(`Could not resolve ${songTitle}?`);
            continue;
        }

        for (const chart of chartData._items) {
            let playtype: "SP" | "DP" = chart.play_style === "DOUBLE" ? "DP" : "SP";
            let difficulty = chart.difficulty === "BLACK" ? "LEGGENDARIA" : chart.difficulty;
            let version = "27";

            // yeah this fails for wacky playtype mismatches -- i don't care.
            if (
                ["ミッドナイト堕天使", "Y&Co. is dead or alive", "State Of The Art"].includes(
                    songTitle
                ) &&
                difficulty === "LEGGENDARIA"
            ) {
                difficulty = "ANOTHER";
            }

            // eslint-disable-next-line no-await-in-loop
            let ktchiChart = await FindChartWithPTDFVersion(
                "iidx",
                song.id,
                playtype,
                difficulty,
                version
            );

            if (!ktchiChart) {
                logger.error(
                    `Could not find chart ${songTitle} ${playtype} ${difficulty} ${version}.`
                );
                continue;
            }

            // eslint-disable-next-line no-await-in-loop
            await ((db.charts.iidx as unknown) as ICollection<
                ChartDocument<"iidx:SP" | "iidx:DP">
            >).update(
                {
                    _id: ktchiChart._id,
                },
                {
                    $set: {
                        "data.arcChartID": chart._id,
                    },
                }
            );
        }
    }

    let r = await db.charts.iidx.update(
        {
            "data.arcChartID": { $exists: false },
        },
        { $set: { "data.arcChartID": null } },
        {
            multi: true,
        }
    );

    logger.info("done.", { r });
}

MergeIDs();
