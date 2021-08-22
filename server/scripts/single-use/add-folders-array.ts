import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

(async () => {
	logger.info(`Setting tableFolders.`);
	const r = await db.charts.bms.update(
		{},
		{ $set: { "data.tableFolders": [] } },
		{ multi: true }
	);
	logger.info(`Done!`, { r });

	process.exit(0);
})();
