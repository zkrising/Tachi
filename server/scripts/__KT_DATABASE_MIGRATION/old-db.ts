import monk from "monk";
import { ServerConfig } from "lib/setup/config";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

logger.info(`Connecting to Old KTDB at ${ServerConfig.MONGO_CONNECTION_URL}/kamaitachidb.`);

export const oldKTDB = monk(`${ServerConfig.MONGO_CONNECTION_URL}/kamaitachidb`);

oldKTDB
	.then(() => {
		logger.info(`Done.`);
	})
	.catch((err) => {
		logger.crit(`Fatal in connecting to old KT DB.`, { err });
		process.exit(1);
	});
