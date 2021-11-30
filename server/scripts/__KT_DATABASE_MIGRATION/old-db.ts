import CreateLogCtx from "lib/logger/logger";
import { Environment } from "lib/setup/config";
import monk from "monk";

const logger = CreateLogCtx(__filename);

logger.info(`Connecting to Old KTDB at ${Environment.mongoUrl}/kamaitachidb.`);

export const oldKTDB = monk(`${Environment.mongoUrl}/kamaitachidb`);

oldKTDB
	.then(() => {
		logger.info(`Done.`);
	})
	.catch((err) => {
		logger.crit(`Fatal in connecting to old KT DB.`, { err });
		process.exit(1);
	});
