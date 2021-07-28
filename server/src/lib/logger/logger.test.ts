import { LOG_LEVEL } from "lib/setup/config";
import t from "tap";
import { CloseAllConnections } from "../../test-utils/close-connections";
import CreateLogCtx, { ChangeRootLogLevel, GetLogLevel, rootLogger, Transports } from "./logger";

t.test("Logger Tests", (t) => {
	const logger = CreateLogCtx(__filename);

	Transports[0].level = "debug"; // lol

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

t.teardown(CloseAllConnections);
