import CreateLogCtx from "lib/logger/logger";
import { MigrateBMSScores } from "./bms";
import { MigrateIIDXScores } from "./iidx";

const logger = CreateLogCtx(__filename);

(async () => {
	logger.info(`Migrating IIDX Scores.`);

	await MigrateIIDXScores();

	logger.info(`Migrating BMS Scores.`);

	await MigrateBMSScores();
})();
