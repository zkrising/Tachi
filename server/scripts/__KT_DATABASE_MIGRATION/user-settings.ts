/* eslint-disable @typescript-eslint/no-explicit-any */

import db from "external/mongo/db";
import MigrateRecords from "./migrate";
import { DEFAULT_USER_SETTINGS } from "server/router/api/v1/auth/auth";

function ConvertFn(c: any) {
	return { userID: c.id, preferences: DEFAULT_USER_SETTINGS };
}

(async () => {
	await MigrateRecords(db["user-settings"], "users", ConvertFn);

	process.exit(0);
})();
