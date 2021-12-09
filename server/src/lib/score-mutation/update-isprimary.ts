/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { TachiConfig } from "lib/setup/config";

export default async function UpdateIsPrimaryStatus() {
	for (const game of TachiConfig.GAMES) {
		const chartIDs = (
			await db.charts[game].find({
				isPrimary: false,
			})
		).map((e) => e.chartID);

		await db.scores.update(
			{
				chartID: { $in: chartIDs },
			},
			{ $set: { isPrimary: false } }
		);

		await db["personal-bests"].update(
			{
				chartID: { $in: chartIDs },
			},
			{ $set: { isPrimary: false } }
		);
	}
}

// The easier way to do this is just to always update the isPrimary status
// Left, for posterities sake, is an incredibly sub-optimal aggregate that
// achieves this also.
//
// const scores = await db.scores.aggregate([
// 	{
// 		$match: {
// 			game: "iidx",
// 		},
// 	},
// 	{
// 		$lookup: {
// 			from: "charts-iidx",
// 			localField: "chartID",
// 			foreignField: "chartID",
// 			as: "chart",
// 		},
// 	},
// 	{
// 		$unwind: {
// 			path: "$chart",
// 		},
// 	},
// 	// This is the best way to do $match $ne, according to SO.
// 	{
// 		$addFields: {
// 			needsUpdate: {
// 				$ne: ["$chart.isPrimary", "$isPrimary"],
// 			},
// 		},
// 	},
// 	{
// 		$match: {
// 			needsUpdate: true,
// 		},
// 	},
// ]);
