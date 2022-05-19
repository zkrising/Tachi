// Before we run anything, set a global to indicate to the code that
// we're running as a server, and not as a job runner or score worker.
import db from "external/mongo/db";
import { SetIndexesIfNoneSet } from "external/mongo/indexes";
import { InitSequenceDocs } from "external/mongo/sequence-docs";
import { LoadDefaultClients } from "lib/builtin-clients/builtin-clients";
import { VERSION_PRETTY } from "lib/constants/version";
import { HandleSIGTERMGracefully } from "lib/handlers/sigterm";
import CreateLogCtx from "lib/logger/logger";
import { ApplyUnappliedMigrations } from "lib/migration/migrations";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import server from "server/server";
import fetch from "utils/fetch";
import { InitaliseFolderChartLookup } from "utils/folder";
import { spawn } from "child_process";
import fs from "fs";
import https from "https";
import path from "path";
import type http from "http";

process.env.IS_SERVER = "true";

const logger = CreateLogCtx(__filename);

logger.info(`Booting ${TachiConfig.NAME} - ${VERSION_PRETTY} [ENV: ${Environment.nodeEnv}]`, {
	bootInfo: true,
});
logger.info(`Log level is set to ${ServerConfig.LOGGER_CONFIG.LOG_LEVEL}.`, { bootInfo: true });

logger.info(`Loading sequence documents...`, { bootInfo: true });

async function RunOnInit() {
	await InitSequenceDocs();
	await SetIndexesIfNoneSet();

	await ApplyUnappliedMigrations();

	await db["folder-chart-lookup"].findOne().then((r) => {
		// If there are no folder chart lookups, initialise them.
		if (!r) {
			InitaliseFolderChartLookup().catch((err: unknown) => {
				logger.error(`Failed to init folder-chart-lookup on first boot?`, { err });
			});
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

void RunOnInit();

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
	HandleSIGTERMGracefully(instance);
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
