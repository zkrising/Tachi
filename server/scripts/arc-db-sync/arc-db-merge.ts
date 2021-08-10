import fs from "fs";
import { ICollection } from "monk";
import path from "path";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/common/logger";
import { ChartDocument } from "tachi-common";
import { FindSongOnTitle } from "../../src/common/database-lookup/song";
import { FindChartWithPTDFVersion } from "../../src/common/database-lookup/chart";

const logger = CreateLogCtx(__filename);

async function MergeIDs() {
	const charts = JSON.parse(fs.readFileSync(path.join(__dirname, "./charts.json"), "utf-8"));

	for (const chartData of charts) {
		const songTitle = chartData._related.music[0].title;

		// eslint-disable-next-line no-await-in-loop
		const song = await FindSongOnTitle("iidx", songTitle);

		if (!song) {
			logger.error(`Could not resolve ${songTitle}?`);
			continue;
		}

		for (const chart of chartData._items) {
			const playtype: "SP" | "DP" = chart.play_style === "DOUBLE" ? "DP" : "SP";
			let difficulty = chart.difficulty === "BLACK" ? "LEGGENDARIA" : chart.difficulty;
			const version = "27-omni";

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
			const tachiChart = await FindChartWithPTDFVersion(
				"iidx",
				song.id,
				playtype,
				difficulty,
				version
			);

			if (!tachiChart) {
				logger.error(
					`Could not find chart ${songTitle} ${playtype} ${difficulty} ${version}.`
				);
				continue;
			}

			// eslint-disable-next-line no-await-in-loop
			await (
				db.charts.iidx as unknown as ICollection<ChartDocument<"iidx:SP" | "iidx:DP">>
			).update(
				{
					_id: tachiChart._id,
				},
				{
					$set: {
						"data.arcChartID": chart._id,
					},
				}
			);
		}
	}

	const r = await db.charts.iidx.update(
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
