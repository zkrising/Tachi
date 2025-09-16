import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "chunithm-fix-preferred-default-enum",
	up: async () => {
		await db["game-settings"].update(
			{
				game: "chunithm",
				"preferences.preferredDefaultEnum": "lamp",
			},
			{
				$set: {
					"preferences.preferredDefaultEnum": "noteLamp",
				},
			},
			{ multi: true }
		);
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
