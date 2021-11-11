/* eslint-disable @typescript-eslint/no-explicit-any */

import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { UserGoalDocument } from "tachi-common";
import MigrateRecords from "./migrate";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<UserGoalDocument | null> {
	// const newUG: UserGoalDocument = {};

	const relatedGoal = await db.goals.findOne({ goalID: c.goalID });

	if (!relatedGoal) {
		return null;
	}

	return c;
}

(async () => {
	await MigrateRecords(db["user-goals"], "user-goals", ConvertFn);

	process.exit(0);
})();
