/* eslint-disable no-await-in-loop */
import fetch from "node-fetch";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { Difficulties, ESDCore, IIDXBPIData, ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { config } from "process";
import { FindChartWithPTDFVersion } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import { RecalcAllScores } from "../__KT_DATABASE_MIGRATION/state-sync/recalc-all-scores";

const program = new Command();

const logger = CreateLogCtx(__filename);

program.option("-f, --fetch", "Fetch the latest data from the poyashi repo.");

program.parse(process.argv);
const options = program.opts();

const dataLoc = path.join(__dirname, "./output.json");

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
		const rj = await fetch("https://proxy.poyashi.me/?type=bpi").then((r) => r.json());

		logger.info("Fetched data.");
		fs.writeFileSync(dataLoc, JSON.stringify(rj));
		logger.info("Saved data to output.json.");

		data = rj;
	} else {
		logger.info("Reading data from output.json...");
		data = JSON.parse(fs.readFileSync(dataLoc, "utf-8"));
	}

	const realData: IIDXBPIData[] = [];
	for (const d of data.body) {
		const res = difficultyResolve[d.difficulty];

		if (!res) {
			throw new Error(`Unknown difficulty ${d.difficulty}`);
		}

		const [playtype, diff] = res;

		const tachiSong = await FindSongOnTitle("iidx", d.title);

		if (!tachiSong) {
			logger.warn(`Cannot find song ${d.title}?`);
			continue;
		}

		const tachiChart = (await FindChartWithPTDFVersion(
			"iidx",
			tachiSong.id,
			playtype as "SP" | "DP",
			diff as Difficulties["iidx:DP" | "iidx:SP"],
			"27"
		)) as ChartDocument<"iidx:SP" | "iidx:DP">;

		if (!tachiChart) {
			logger.warn(
				`Cannot find chart ${tachiSong.title} (${tachiSong.id}) ${playtype}, ${diff}?`
			);
			continue;
		}

		const kavg = Number(d.avg);

		if (kavg < 0) {
			logger.warn(
				`${tachiSong.title} (${playtype} ${diff}). Invalid kavg ${d.avg}, Skipping.`
			);
			continue;
		}

		if (d.removed) {
			logger.info(`Skipping removed chart ${tachiSong.title}.`);
			continue;
		}

		realData.push({
			coef: d.coef === -1 ? null : d.coef,
			kavg: Number(d.avg),
			wr: Number(d.wr),
			chartID: tachiChart.chartID,
		});
	}

	await db["iidx-bpi-data"].remove({});
	await db["iidx-bpi-data"].insert(realData);

	logger.info(`Removed all, and inserted ${realData.length} documents.`);

	logger.info(`Triggering IIDX Recalc.`);

	await RecalcAllScores({ game: "iidx" });

	logger.info(`Done.`);
}

if (require.main === module) {
	UpdatePoyashiData();
}
