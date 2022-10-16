import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "add-preferredRanking-to-ugpt",
	up: async () => {
		await db["game-settings"].update(
			{},
			{
				$set: {
					"preferences.preferredRanking": null,
				},
			},
			{ multi: true }
		);
	},
	down: async () => {
		await db["game-settings"].update(
			{},
			{
				$unset: { "preferences.preferredRanking": 1 },
			},
			{ multi: true }
		);
	},
};

export default migration;
