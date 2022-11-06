import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "mark-fervidex-as-without-intent",
	up: async () => {
		await db.imports.update(
			{
				importType: "ir/fervidex",
			},
			{
				$set: { userIntent: false },
			}
		);
	},
	down: () => {
		throw new Error(`Unable to revert transaction.`);
	},
};

export default migration;
