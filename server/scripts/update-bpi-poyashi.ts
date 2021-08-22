/* eslint-disable no-await-in-loop */
import fetch from "node-fetch";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { config, Difficulties, ESDCore, IIDXBPIData, ChartDocument } from "tachi-common";
import { FindSongOnTitle } from "../src/score-import/database-lookup/song-title";
import {
	FindChartWithPTDF,
	FindChartWithPTDFVersion,
} from "../src/score-import/database-lookup/chart-ptdf";
import db from "external/mongo/db";
import CreateLogCtx from "../src/common/logger";
const program = new Command();

const logger = CreateLogCtx(__filename);

program.option("-f, --fetch", "Fetch the latest data from the poyashi repo.");

program.parse(process.argv);
const options = program.opts();

const dataLoc = path.join(__dirname, "./bpi-poyashi-data/output.json");

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
		const rj = await fetch(
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
			"28"
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

		const kesd = ESDCore.CalculateESD(
			config.judgementWindows.iidx.SP,
			kavg / (tachiChart.data.notecount * 2)
		);

		realData.push({
			coef: d.coef === -1 ? null : d.coef,
			kavg: Number(d.avg),
			wr: Number(d.wr),
			chartID: tachiChart.chartID,
			kesd,
		});
	}

	await db["iidx-bpi-data"].remove({});
	await db["iidx-bpi-data"].insert(realData);

	logger.info(`Removed all, and inserted ${realData.length} documents.`);
}

UpdatePoyashiData();
