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

import createLogCtx from "./logger";
import server from "./server";
import serverConfig from "./server-config";

const logger = createLogCtx("main.ts");

logger.info(`Booting Kamaitachi BLACK - ${FormatVersion()}`);

server.listen(serverConfig.PORT);
logger.info(`Listening on ${serverConfig.PORT}`);
