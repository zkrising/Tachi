import CreateLogCtx from "./lib/logger/logger";
import server from "./server/server";
import { CONF_INFO, LOG_LEVEL, PORT } from "./lib/setup/config";

import { FormatVersion } from "./lib/constants/version";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${CONF_INFO.name} - ${FormatVersion()} [ENV: ${process.env.NODE_ENV}]`);
logger.info(`Log level is set to ${LOG_LEVEL}.`);

server.listen(PORT);
logger.info(`Listening on port ${PORT}`);
