import t from "tap";
import ScoreImportFatalError from "./score-import-error";

t.test("#new ScoreImportFatalError()", (t) => {
	const err = new ScoreImportFatalError(500, "error message");

	t.equal(err.statusCode, 500, "Should store the status code passed to it.");
	t.equal(err.message, "error message", "Should store description as the error message.");

	t.end();
});
