import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "add-friends-to-users",
	up: async () => {
		await db["user-settings"].update(
			{},
			{
				$set: {
					friends: [],
				},
			},
			{ multi: true }
		);
	},
	down: async () => {
		await db["user-settings"].update(
			{},
			{
				$unset: { friends: 1 },
			},
			{ multi: true }
		);
	},
};

export default migration;
