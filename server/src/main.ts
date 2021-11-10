import { spawn } from "child_process";
import db, { monkDB } from "external/mongo/db";
import { SetIndexesIfNoneSet } from "external/mongo/indexes";
import { InitSequenceDocs } from "external/mongo/sequence-docs";
import fs from "fs";
import https from "https";
import { LoadDefaultClients } from "lib/builtin-clients/builtin-clients";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import path from "path";
import server from "server/server";
import { InitaliseFolderChartLookup } from "utils/folder";
import { FormatVersion } from "./lib/constants/version";
import fetch from "utils/fetch";
import http from "http";
import { CloseRedisConnection } from "external/redis/redis";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${TachiConfig.NAME} - ${FormatVersion()} [ENV: ${Environment.nodeEnv}]`, {
	bootInfo: true,
});
logger.info(`Log level is set to ${ServerConfig.LOGGER_CONFIG.LOG_LEVEL}.`, { bootInfo: true });

logger.info(`Loading sequence documents...`, { bootInfo: true });

async function RunOnInit() {
	await InitSequenceDocs();
	await SetIndexesIfNoneSet();

	await db["folder-chart-lookup"].findOne().then((r) => {
		// If there are no folder chart lookups, initialise them.
		if (!r) {
			InitaliseFolderChartLookup();
		}
	});

	await LoadDefaultClients();

	try {
		await fetch("https://example.com");
	} catch (err) {
		logger.crit(
			`Cannot send HTTPS request to https://example.com. This instance of tachi-server cannot access the internet?`,
			err
		);
		process.exit(1);
	}
}

RunOnInit();

let instance: http.Server | https.Server;

if (ServerConfig.ENABLE_SERVER_HTTPS) {
	logger.warn(
		"HTTPS Mode is enabled. This should not be used in production, and you should instead run behind a reverse proxy.",
		{ bootInfo: true }
	);
	const privateKey = fs.readFileSync("./cert/key.pem");
	const certificate = fs.readFileSync("./cert/cert.pem");

	const httpsServer = https.createServer({ key: privateKey, cert: certificate }, server);

	instance = httpsServer.listen(Environment.port);
	logger.info(`HTTPS Listening on port ${Environment.port}`, { bootInfo: true });
} else {
	instance = server.listen(Environment.port);
	logger.info(`HTTP Listening on port ${Environment.port}`, { bootInfo: true });
}

process.on("SIGTERM", () => {
	logger.info("SIGTERM Received, closing program.", { shutdownInfo: true });

	instance.close(async () => {
		logger.info("Closing Mongo Database.", { shutdownInfo: true });
		await monkDB.close();

		logger.info("Closing Redis Connection.", { shutdownInfo: true });
		CloseRedisConnection();

		logger.info("Everything closed. Waiting for process to exit naturally.", {
			shutdownInfo: true,
		});
	});
});

if (process.env.INVOKE_JOB_RUNNER) {
	logger.info(`Spawning a tachi-server job runner inline.`, { bootInfo: true });

	if (Environment.nodeEnv === "production") {
		logger.warn(
			`Spawning inline tachi-server job runner in production. Is this actually what you want? You should run a tool like Ofelia to manage this.`,
			{ bootInfo: true }
		);
	}

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
