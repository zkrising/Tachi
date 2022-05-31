import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "add-rivals-to-ugpt",
	up: async () => {
		await db["game-settings"].update(
			{},
			{
				$set: {
					rivals: [],
				},
			},
			{ multi: true }
		);
	},
	down: async () => {
		await db["game-settings"].update(
			{},
			{
				$unset: { rivals: 1 },
			},
			{ multi: true }
		);
	},
};

export default migration;
