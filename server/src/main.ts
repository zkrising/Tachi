import CreateLogCtx from "lib/logger/logger";
import server from "server/server";
import { ServerTypeInfo, ServerConfig } from "lib/setup/config";
import https from "https";
import fs from "fs";

import { FormatVersion } from "./lib/constants/version";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${ServerTypeInfo.name} - ${FormatVersion()} [ENV: ${process.env.NODE_ENV}]`);
logger.info(`Log level is set to ${ServerConfig.LOG_LEVEL}.`);

if (ServerConfig.ENABLE_SERVER_HTTPS) {
	logger.warn(
		"HTTPS Mode is enabled. This should not be used in production, and you should instead run behind a reverse proxy."
	);
	const privateKey = fs.readFileSync("./cert/key.pem");
	const certificate = fs.readFileSync("./cert/cert.pem");

	const httpsServer = https.createServer({ key: privateKey, cert: certificate }, server);

	httpsServer.listen(ServerConfig.PORT);
	logger.info(`HTTPS Listening on port ${ServerConfig.PORT}`);
} else {
	server.listen(ServerConfig.PORT);
	logger.info(`HTTP Listening on port ${ServerConfig.PORT}`);
}
