import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "sdvx-maxxive-lamp-rearrange",
	up: async () => {
		await db.goals.update(
			{
				game: "sdvx",
				"criteria.key": "lamp",
				"criteria.value": 4,
				name: /PERFECT ULTIMATE CHAIN/u,
			},
			{
				$set: {
					"criteria.value": 5,
				},
			}
		);

		await db.goals.update(
			{
				game: "sdvx",
				"criteria.key": "lamp",
				"criteria.value": 3,
			},
			{
				$set: {
					"criteria.value": 4,
				},
			}
		);
	},
	down: () => {
		throw new Error("not doing this");
	},
};

export default migration;
