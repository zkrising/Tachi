/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc, UpdateChartRanking } from "lib/score-import/framework/pb/create-pb-doc";

const logger = CreateLogCtx(__filename);

(async () => {
	// in an alternate timeline this would be 2020 10 02,
	// but i have to account for *those* idiots.
	// who now mean i'm shredding other people scores.
	// - not zkldi
	const hvSt = new Date(2020, 9, 1);

	const charts = await db.charts.iidx.find({
		songID: 167, // 761 -> rising in the sun; 167 -> sometime.
		isPrimary: false,
	});

	const chartIDs = charts.map((e) => e.chartID);

	const affectedUsers = await db.scores.find({
		chartID: { $in: chartIDs },
		timeAchieved: {
			$gt: hvSt.getTime(),
		},
	});

	const userIDs = affectedUsers.map((e) => e.userID);

	const r = await db.scores.remove({
		chartID: { $in: chartIDs },
		timeAchieved: {
			$gt: hvSt.getTime(),
		},
	});

	logger.info(`Destroyed scores.`, { r });

	for (const userID of userIDs) {
		logger.info(`Reprocessing PBs for ${userID}`);

		for (const chartID of chartIDs) {
			const scores = await db.scores.find({
				chartID,
				userID,
			});

			if (scores.length === 0) {
				await db["personal-bests"].remove({
					chartID,
					userID,
				});
			} else {
				const pbDoc = await CreatePBDoc(userID, chartID, logger);

				await db["personal-bests"].update(
					{
						chartID,
						userID,
					},
					{
						$set: pbDoc,
					},
					{
						upsert: true,
					}
				);

				await UpdateChartRanking(chartID);
			}
		}
	}

	logger.info(`Done`);
})();
