import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "remove-multifolder-stats",
	up: async () => {
		await db["game-settings"].update(
			{
				"preferences.stats.mode": "folder",
				"preferences.stats.folderID": { $type: "array" },
			},
			{
				$pull: {
					"preferences.stats": {
						folderID: { $type: "array" },
					},
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
