/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import { ChartDocument, Difficulties, IIDXBPIData } from "tachi-common";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { FindChartWithPTDFVersion } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";

const logger = CreateLogCtx(__filename);

const difficultyResolve: Record<string, [string, string]> = {
	3: ["SP", "HYPER"],
	4: ["SP", "ANOTHER"],
	8: ["DP", "HYPER"],
	9: ["DP", "ANOTHER"],
	10: ["SP", "LEGGENDARIA"],
	11: ["DP", "LEGGENDARIA"],
};

async function UpdatePoyashiData() {
	logger.info("Fetching BPI Poyashi data from proxy...");
	const rj = await fetch("https://proxy.poyashi.me/?type=bpi").then((r) => r.json());

	logger.info("Fetched data.");

	const data = rj;

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
			"29"
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

	const updatedCharts = [];
	for (const newData of realData) {
		const oldData = await db["iidx-bpi-data"].findOne({
			chartID: newData.chartID,
		});

		if (!oldData) {
			updatedCharts.push(newData.chartID);
		} else if (
			oldData.wr !== newData.wr ||
			oldData.kavg !== newData.kavg ||
			oldData.coef !== newData.coef
		) {
			updatedCharts.push(newData.chartID);
			await db["iidx-bpi-data"].update(
				{
					chartID: newData.chartID,
				},
				{
					$set: {
						wr: newData.wr,
						kavg: newData.kavg,
						coef: newData.coef,
					},
				}
			);
		}
	}

	if (updatedCharts.length === 0) {
		logger.info(`Nothing has changed. Not updating any BPI data.`);
		return;
	}

	logger.info(`Triggering IIDX Recalc for ${updatedCharts.length} charts.`);

	await RecalcAllScores({ game: "iidx", chartID: { $in: updatedCharts } });

	logger.info(`Done.`);
}

if (require.main === module) {
	UpdatePoyashiData().then(() => process.exit(0));
}
