import fs from "fs";
import path from "path";

import db from "../../../src/external/mongo/db";

(async () => {
	const data = JSON.parse(fs.readFileSync(path.join(__dirname, "courses.json"), "utf-8"));

	await db["bms-course-lookup"].insert(data);
})();
