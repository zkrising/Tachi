import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "mark-fervidex-as-without-intent",
	up: async () => {
		await db.imports.update(
			{
				importType: { $in: ["ir/kshook-sv6c", "ir/kshook-sv6c-static"] },
			},
			{
				userIntent: false,
			}
		);
	},
	down: () => {
		throw new Error(`Unable to revert transaction.`);
	},
};

export default migration;
