import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "add-following-to-users",
	up: async () => {
		await db["user-settings"].update(
			{},
			{
				$set: {
					following: [],
				},
			},
			{ multi: true }
		);
	},
	down: async () => {
		await db["user-settings"].update(
			{},
			{
				$unset: { following: 1 },
			},
			{ multi: true }
		);
	},
};

export default migration;
