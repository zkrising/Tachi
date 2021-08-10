import db from "../db/db";
import CreateLogCtx from "../common/logger";

const logger = CreateLogCtx(__filename);

(async () => {
	const users = await db.counters.findOne({
		counterName: "users",
	});

	if (users) {
		throw new Error(`"users" document already exists, exiting.`);
	}

	await db.counters.insert({
		counterName: "users",
		value: 1,
	});

	logger.info("Successfully initialised counter documents. Exiting.");
	process.exit(0);
})();
