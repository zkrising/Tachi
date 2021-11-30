import CreateLogCtx from "lib/logger/logger";
import { MigrateBMSScores } from "./bms";
import { MigrateCHUNITHMScores } from "./chunithm";
import { MigrateIIDXScores } from "./iidx";
import { MigrateMusecaScores } from "./museca";
import { MigrateSDVXScores } from "./sdvx";

const logger = CreateLogCtx(__filename);

(async () => {
	logger.info(`Migrating IIDX Scores.`);

	await MigrateIIDXScores();

	logger.info(`Migrating BMS Scores.`);
	await MigrateBMSScores();

	logger.info(`Migrating MUSECA Scores.`);

	await MigrateMusecaScores();

	logger.info(`Migrating SDVX Scores.`);

	await MigrateSDVXScores();

	logger.info(`Migrating CHUNITHM Scores.`);

	await MigrateCHUNITHMScores();

	logger.info("Done.");

	process.exit(0);
})();
