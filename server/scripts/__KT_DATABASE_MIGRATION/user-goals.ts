/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserGoalDocument } from "kamaitachi-common";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/logger";
import MigrateRecords from "./migrate";

const logger = CreateLogCtx("user-goals.ts");

async function ConvertFn(c: any): Promise<UserGoalDocument | null> {
    // const newUG: UserGoalDocument = {};

    let relatedGoal = await db.goals.findOne({ goalID: c.goalID });

    if (!relatedGoal) {
        return null;
    }

    return c;
}

(async () => {
    await MigrateRecords(db["user-goals"], "user-goals", ConvertFn);

    process.exit(0);
})();
