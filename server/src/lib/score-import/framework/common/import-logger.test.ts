import t from "tap";
import { CreateImportLoggerAndID } from "./import-logger";
import { PublicUserDocument } from "tachi-common";

t.test("#CreateImportLoggerAndID", (t) => {
	const { importID, logger } = CreateImportLoggerAndID(
		{ username: "foo", id: 1 } as PublicUserDocument,
		"file/eamusement-iidx-csv"
	);

	t.match(importID, /^[a-f0-9]{40}$/u, "Should return a 40 character importID.");

	// not possible to automate this, probably.
	logger.info(
		"Namespaced log test - if this does not have 'file/eamusement-iidx-csv | foo (#1)' next to it, it's broke."
	);

	t.end();
});
