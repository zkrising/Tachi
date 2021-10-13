import CreateLogCtx from "lib/logger/logger";
import server from "server/server";
import { ServerTypeInfo, ServerConfig } from "lib/setup/config";
import https from "https";
import fs from "fs";
import { FormatVersion } from "./lib/constants/version";
import { spawn } from "child_process";
import path from "path";

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

if (ServerConfig.INVOKE_JOB_RUNNER || process.env.INVOKE_JOB_RUNNER) {
	logger.info(`Spawning a tachi-server job runner.`);

	// Spawn as a separate process to avoid hogging the main thread.
	const jobProcess = spawn(
		"ts-node",
		[
			// Note: Can't use -r tsconfig-paths/register here
			// because that is rejected by some library called
			// arg.
			// I'm not sure why.
			"--require=tsconfig-paths/register",
			path.join(__dirname, "../src/lib/jobs/job-runner.ts"),
		],
		{
			stdio: "inherit",
		}
	);

	jobProcess.on("error", (err) => {
		logger.crit(`Failed to spawn job runner. Terminating process.`, { err });
		process.exit(1);
	});
}
