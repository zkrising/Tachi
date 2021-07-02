import CreateLogCtx from "./lib/logger/logger";
import server from "./server/server";
import { CONF_INFO, LOG_LEVEL, PORT, ENABLE_SERVER_HTTPS } from "./lib/setup/config";
import https from "https";
import fs from "fs";

import { FormatVersion } from "./lib/constants/version";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${CONF_INFO.name} - ${FormatVersion()} [ENV: ${process.env.NODE_ENV}]`);
logger.info(`Log level is set to ${LOG_LEVEL}.`);

if (ENABLE_SERVER_HTTPS) {
	logger.warn(
		"HTTPS Mode is enabled. This should not be used in production, and you should instead run behind a reverse proxy."
	);
	const privateKey = fs.readFileSync("./cert/key.pem");
	const certificate = fs.readFileSync("./cert/cert.pem");

	const httpsServer = https.createServer({ key: privateKey, cert: certificate }, server);

	httpsServer.listen(PORT);
	logger.info(`HTTPS Listening on port ${PORT}`);
} else {
	server.listen(PORT);
	logger.info(`HTTP Listening on port ${PORT}`);
}
