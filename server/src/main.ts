import CreateLogCtx from "./lib/logger/logger";
import server from "./server/server";
import serverConfig from "./server/server-config";
import { LOG_LEVEL } from "./lib/env/env";
import { FormatVersion } from "./lib/constants/version";

const logger = CreateLogCtx(__filename);

logger.info(`Booting Kamaitachi BLACK - ${FormatVersion()} [ENV: ${process.env.NODE_ENV}]`);
logger.info(`Log level on ${LOG_LEVEL ?? "info"}.`);

server.listen(serverConfig.PORT);
logger.info(`Listening on ${serverConfig.PORT}`);
