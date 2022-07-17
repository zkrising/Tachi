import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "update-jubeat-preferred-tables",
	up: async () => {
		await db["game-settings"].update(
			{
				game: "jubeat",
			},
			{
				$set: {
					"preferences.defaultTable": null,
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
