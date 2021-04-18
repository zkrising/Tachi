import t from "tap";
import CreateLogCtx, { Transports } from "./logger";

t.test("Logger Tests", (t) => {
    const logger = CreateLogCtx("logger.test.ts");

    Transports[2].level = "debug"; // lol

    logger.debug("Debug Message Test");
    logger.verbose("Verbose Message Test");
    logger.info("Info Message Test");
    logger.warn("Warning Message Test");
    logger.error("Error Message Test");
    logger.severe("Severe Message Test");
    logger.crit("Critical Message Test");

    Transports[2].level = "info"; // lol

    logger.debug("This message shouldn't appear.");

    t.end();
});
