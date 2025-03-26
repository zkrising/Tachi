import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "add-ongeki-abplus",
	up: async () => {
		await db.scores.update(
			{ $and: [{ game: "ongeki" }, { "scoreData.score": 1010000 }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK+",
				},
			},
			{ multi: true }
		);

		await db["personal-bests"].update(
			{ $and: [{ game: "ongeki" }, { "scoreData.score": 1010000 }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK+",
				},
			},
			{ multi: true }
		);
	},
	down: async () => {
		await db.scores.update(
			{ $and: [{ game: "ongeki" }, { "scoreData.noteLamp": "ALL BREAK+" }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK",
				},
			},
			{ multi: true }
		);
		await db["personal-bests"].update(
			{ $and: [{ game: "ongeki" }, { "scoreData.noteLamp": "ALL BREAK+" }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK",
				},
			},
			{ multi: true }
		);
	},
};

export default migration;
