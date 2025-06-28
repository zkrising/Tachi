import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "sdvx-maxxive-lamp-rearrange",
	up: async () => {
		await db.scores.updateMany(
			{
				game: "sdvx",
				"scoreData.lamp": "ULTIMATE CHAIN",
			},
			{
				$set: {
					"scoreData.enumIndexes.lamp": 4,
				},
			}
		);

		await db.scores.updateMany(
			{
				game: "sdvx",
				"scoreData.lamp": "PERFECT ULTIMATE CHAIN",
			},
			{
				$set: {
					"scoreData.enumIndexes.lamp": 5,
				},
			}
		);
	},
	down: async () => {
		await db.scores.updateMany(
			{
				game: "sdvx",
				"scoreData.lamp": "ULTIMATE CHAIN",
			},
			{
				$set: {
					"scoreData.enumIndexes.lamp": 3,
				},
			}
		);

		await db.scores.updateMany(
			{
				game: "sdvx",
				"scoreData.lamp": "PERFECT ULTIMATE CHAIN",
			},
			{
				$set: {
					"scoreData.enumIndexes.lamp": 4,
				},
			}
		);
	},
};

export default migration;
