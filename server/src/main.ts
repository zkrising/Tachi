// The Downward Spiral
const VERSION_INFO = {
    major: 2,
    minor: 0,
    patch: 0,
    name: "Mr. Self Destruct",
};

function FormatVersion() {
    const { major, minor, patch, name } = VERSION_INFO;
    return `v${[major, minor, patch].join(".")} (${name})`;
}

import CreateLogCtx from "./logger/logger";
import server from "./server/server";
import serverConfig from "./server/server-config";
import dotenv from "dotenv";

dotenv.config();

const logger = CreateLogCtx(__filename);

logger.info(`Booting Kamaitachi BLACK - ${FormatVersion()} [ENV: ${process.env.NODE_ENV}]`);
logger.info(`Log level on ${process.env.LOG_LEVEL ?? "info"}.`);

server.listen(serverConfig.PORT);
logger.info(`Listening on ${serverConfig.PORT}`);
