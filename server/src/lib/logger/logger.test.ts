import CreateLogCtx, { ChangeRootLogLevel, GetLogLevel, rootLogger, Transports } from "./logger";
import { ServerConfig } from "lib/setup/config";
import t from "tap";

const LOG_LEVEL = ServerConfig.LOGGER_CONFIG.LOG_LEVEL;

t.test("Logger Tests", (t) => {
	const logger = CreateLogCtx(__filename);

	if (!Transports[0]) {
		throw new Error(`No transports were defined? Can't perform logger tests.`);
	}

	// lol
	Transports[0].level = "debug";

	logger.debug("Debug Message Test");
	logger.verbose("Verbose Message Test");
	logger.info("Info Message Test");
	logger.warn("Warning Message Test");
	logger.error("Error Message Test");
	logger.severe("Severe Message Test");
	logger.crit("Critical Message Test");

	Transports[0].level = process.env.LOG_LEVEL ?? "info";

	logger.debug("This message shouldn't appear.");

	t.end();
});

t.test("#GetLogLevel", (t) => {
	t.equal(GetLogLevel(), LOG_LEVEL);

	ChangeRootLogLevel("crit");
	t.equal(GetLogLevel(), "crit");

	ChangeRootLogLevel(LOG_LEVEL);
	t.equal(GetLogLevel(), LOG_LEVEL);

	t.end();
});

t.test("#ChangeRootLogLevel", (t) => {
	t.test("Should work with the root logger.", (t) => {
		rootLogger.info("The below message should appear.");

		ChangeRootLogLevel("verbose");
		rootLogger.verbose("== SHOULD APPEAR ==");

		ChangeRootLogLevel("info");

		rootLogger.info("The below message SHOULD NOT appear.");

		rootLogger.verbose("== SHOULD NOT APPEAR ==");

		t.end();
	});

	t.end();
});
