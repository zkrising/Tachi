import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "fix-undefined-bms-data",
	up: async () => {
		await db.songs.bms.update(
			{
				"data.tableString": { $exists: false },
			},
			{
				$set: {
					"data.tableString": null,
				},
			},
			{ multi: true }
		);

		await db.charts.bms.update(
			{
				"data.aiLevel": { $exists: false },
			},
			{
				$set: {
					"data.aiLevel": null,
				},
			},
			{ multi: true }
		);
	},
	down: () => {
		throw new Error(`Cannot revert migration.`);
	},
};

export default migration;
