import t from "tap";
import { CreateImportLoggerAndID } from "./import-logger";
import { PublicUserDocument } from "kamaitachi-common";
import { Logger } from "winston";

t.test("#CreateImportLoggerAndID", (t) => {
    let { importID, logger } = CreateImportLoggerAndID(
        { username: "foo", id: 1 } as PublicUserDocument,
        "file/csv:eamusement-iidx"
    );

    t.match(importID, /^[a-f0-9]{40}$/u, "Should return a 40 character importID.");

    // not possible to automate this, probably.
    logger.info(
        "Namespaced log test - if this does not have 'file/csv:eamusement-iidx | foo (#1)' next to it, it's broke."
    );

    t.end();
});
