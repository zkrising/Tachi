import { spawn } from "child_process";
import db, { monkDB } from "external/mongo/db";
import { SetIndexesWithDB } from "external/mongo/indexes";
import { InitSequenceDocs } from "external/mongo/sequence-docs";
import fs from "fs";
import https from "https";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig, ServerTypeInfo } from "lib/setup/config";
import path from "path";
import server from "server/server";
import { FormatVersion } from "./lib/constants/version";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${ServerTypeInfo.name} - ${FormatVersion()} [ENV: ${Environment.nodeEnv}]`);
logger.info(`Log level is set to ${ServerConfig.LOG_LEVEL}.`);

logger.info(`Loading sequence documents...`);
InitSequenceDocs();

// If no indexes are set, then we need to load mongo indexes.
db.users.indexes().then((r) => {
	// If there's only one index on users
	// that means that only _id has indexes.
	// This means that there are likely to be no indexes
	// configured in the database.
	if (Object.keys(r).length === 1) {
		logger.info(`First-time Mongo startup detected. Running SetIndexes.`);
		SetIndexesWithDB(monkDB, true);
	}
});

if (ServerConfig.ENABLE_SERVER_HTTPS) {
	logger.warn(
		"HTTPS Mode is enabled. This should not be used in production, and you should instead run behind a reverse proxy."
	);
	const privateKey = fs.readFileSync("./cert/key.pem");
	const certificate = fs.readFileSync("./cert/cert.pem");

	const httpsServer = https.createServer({ key: privateKey, cert: certificate }, server);

	httpsServer.listen(Environment.port);
	logger.info(`HTTPS Listening on port ${Environment.port}`);
} else {
	server.listen(Environment.port);
	logger.info(`HTTP Listening on port ${Environment.port}`);
}

if (process.env.INVOKE_JOB_RUNNER) {
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

	process.on("beforeExit", () => {
		logger.info(`Killing Job Runner.`);
		jobProcess.kill();
	});
}
