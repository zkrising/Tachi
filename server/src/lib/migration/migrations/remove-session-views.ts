import db, { monkDB } from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "remove-session-views",
	up: async () => {
		await db.sessions.update(
			{},
			{
				$unset: {
					views: 1,
				},
			},
			{ multi: true }
		);

		// remove session view cache (which no longer exists, so we have to
		// access it raw with monk).
		await monkDB.get("session-view-cache").drop();
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
