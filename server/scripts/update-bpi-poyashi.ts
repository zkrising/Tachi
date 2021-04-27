/* eslint-disable no-await-in-loop */
import fetch from "node-fetch";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { config, Difficulties, ESDCore, IIDXBPIData, ChartDocument } from "kamaitachi-common";
import { FindSongOnTitleVersion } from "../src/score-import/database-lookup/song-title";
import { FindChartWithPTDF } from "../src/score-import/database-lookup/chart-ptdf";
import db from "../src/db/db";
import CreateLogCtx from "../src/logger";
const program = new Command();

const logger = CreateLogCtx("update-bpi-poyashi.ts");

program.option("-f, --fetch", "Fetch the latest data from the poyashi repo.");

program.parse(process.argv);
const options = program.opts();

const dataLoc = path.join(__dirname, "../bpi-poyashi-data/output.json");

const difficultyResolve: Record<string, [string, string]> = {
    3: ["SP", "HYPER"],
    4: ["SP", "ANOTHER"],
    8: ["DP", "HYPER"],
    9: ["DP", "ANOTHER"],
    10: ["SP", "LEGGENDARIA"],
    11: ["DP", "LEGGENDARIA"],
};

async function UpdatePoyashiData() {
    let data;
    if (options.fetch) {
        // lol!
        logger.info("Fetching data from github...");
        let rj = await fetch(
            "https://raw.githubusercontent.com/potakusan/bpim-score-repo/master/output/release.json"
        ).then((r) => r.json());

        logger.info("Fetched data.");
        fs.writeFileSync(dataLoc, JSON.stringify(rj));
        logger.info("Saved data to output.json.");

        data = rj;
    } else {
        logger.info("Reading data from output.json...");
        data = JSON.parse(fs.readFileSync(dataLoc, "utf-8"));
    }

    let realData: IIDXBPIData[] = [];
    for (const d of data) {
        const res = difficultyResolve[d.difficulty];

        if (!res) {
            throw new Error(`Unknown difficulty ${d.difficulty}`);
        }

        const [playtype, diff] = res;

        let ktchiSong = await FindSongOnTitleVersion("iidx", d.title, "28");

        if (!ktchiSong) {
            throw new Error(`Cannot find song ${d.title}?`);
        }

        let ktchiChart = (await FindChartWithPTDF(
            "iidx",
            ktchiSong.id,
            playtype as "SP" | "DP",
            diff as Difficulties["iidx:DP" | "iidx:SP"]
        )) as ChartDocument<"iidx:SP" | "iidx:DP">;

        if (!ktchiChart) {
            throw new Error(
                `Cannot find chart ${ktchiSong.title} (${ktchiSong.id}) ${playtype}, ${diff}?`
            );
        }

        let kavg = Number(d.avg);

        let kesd = ESDCore.CalculateESD(
            config.judgementWindows.iidx.SP,
            kavg / (ktchiChart.data.notecount * 2)
        );

        realData.push({
            coef: d.coef === -1 ? null : d.coef,
            kavg: Number(d.avg),
            wr: Number(d.wr),
            chartID: ktchiChart.chartID,
            kesd,
        });
    }

    await db["iidx-bpi-data"].remove({});
    await db["iidx-bpi-data"].insert(realData);

    logger.info(`Inserted ${realData.length} documents.`);
}

UpdatePoyashiData();
