/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserGoalDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "../../src/common/logger";
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
