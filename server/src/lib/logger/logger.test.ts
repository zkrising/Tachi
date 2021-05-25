import t from "tap";
import { CloseMongoConnection } from "../../external/mongo/db";
import CreateLogCtx, { Transports } from "./logger";

t.test("Logger Tests", (t) => {
    const logger = CreateLogCtx(__filename);

    Transports[2].level = "debug"; // lol

    logger.debug("Debug Message Test");
    logger.verbose("Verbose Message Test");
    logger.info("Info Message Test");
    logger.warn("Warning Message Test");
    logger.error("Error Message Test");
    logger.severe("Severe Message Test");
    logger.crit("Critical Message Test");

    Transports[2].level = process.env.LOG_LEVEL ?? "info";

    logger.debug("This message shouldn't appear.");

    t.end();
});

t.teardown(CloseMongoConnection);
