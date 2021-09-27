/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { rootLogger } from "lib/logger/logger";
import { ChartDocument, Difficulties } from "tachi-common";
import { FindIIDXChartOnInGameID } from "utils/queries/charts";

async function ConvertChart(chart: ChartDocument<"iidx:SP" | "iidx:DP">) {
	// We need to get the related official song. The best way to do this is
	// probably with song IDs.

	const originalChart = await FindIIDXChartOnInGameID(
		chart.data.inGameID,
		chart.playtype,
		chart.difficulty
	);

	if (!originalChart) {
		rootLogger.error(`Can't find original chart.`, { chart });
		throw new Error(`Can't find original chart.`);
	}

	return {
		difficulty: `${chart.data["2dxtraSet"]!} ${chart.difficulty}` as Difficulties[
			| "iidx:SP"
			| "iidx:DP"],
		songID: originalChart!.songID,
	};
}

if (require.main === module) {
	(async () => {
		const modCharts = (await db.charts.iidx.find({
			"data.2dxtraSet": { $ne: null },
			difficulty: { $in: ["BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"] },
		})) as ChartDocument<"iidx:SP" | "iidx:DP">[];

		rootLogger.info(`Modifying ${modCharts.length} charts.`);

		for (const chart of modCharts) {
			const setDoc = await ConvertChart(chart);

			await db.charts.iidx.update(
				{
					chartID: chart.chartID,
				},
				{ $set: setDoc }
			);

			// We're also going to have to port over old scores.

			await db.scores.update(
				{
					chartID: chart.chartID,
				},
				{
					$set: {
						songID: setDoc.songID,
					},
				}
			);
		}

		rootLogger.info(`Removing ${modCharts.length} songs.`);

		await db.songs.iidx.remove({
			songID: { $in: modCharts.map((e) => e.songID) },
		});

		rootLogger.info(`Done.`);
	})();
}
