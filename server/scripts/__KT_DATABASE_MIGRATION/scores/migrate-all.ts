import CreateLogCtx from "lib/logger/logger";
import { MigrateBMSScores } from "./bms";
import { MigrateDDRScores } from "./ddr";
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
})();
