import db from "external/mongo/db";
import { Migration } from "utils/types";

const migration: Migration = {
	id: "add-rivals-to-ugpt",
	up: async () => {
		await db["game-settings"].update(
			{},
			{
				$set: {
					rivals: [],
				},
			}
		);
	},
	down: async () => {
		await db["game-settings"].update(
			{},
			{
				$unset: { rivals: 1 },
			}
		);
	},
};

export default migration;
