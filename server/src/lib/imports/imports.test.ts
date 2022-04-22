import db from "external/mongo/db";
import { ImportDocument } from "tachi-common";
import t from "tap";
import { dmf, mkFakeImport } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPScore } from "test-utils/test-data";
import { RevertImport } from "./imports";

t.test("#RevertImport", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() =>
		db.scores.insert([
			dmf(TestingIIDXSPScore, { scoreID: "score_1" }),
			dmf(TestingIIDXSPScore, { scoreID: "score_2" }),
			dmf(TestingIIDXSPScore, { scoreID: "score_3" }),
		])
	);

	t.test("Should revert an import and all of its contained scores.", async (t) => {
		const importDoc = mkFakeImport({
			scoreIDs: ["score_1", "score_2"],
		});

		await db.imports.insert(importDoc);

		await RevertImport(importDoc);

		const dbRes = await db.imports.findOne({ importID: "fake_import" });

		t.equal(dbRes, null, "Should have removed the import from the DB.");

		t.resolveMatch(
			db.scores.findOne({ userID: 1, scoreID: "score_1" }),
			// @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60020
			null,
			"Score_1 should be removed from the database."
		);

		t.resolveMatch(
			db.scores.findOne({ userID: 1, scoreID: "score_2" }),
			// @ts-expect-error see above
			null,
			"Score_2 should be removed from the database."
		);

		t.resolveMatch(
			db.scores.findOne({ userID: 1, scoreID: "score_3" }),
			// @ts-expect-error see above
			{ scoreID: "score_3" },
			"Score_2 should NOT be removed from the database."
		);

		t.end();
	});

	t.end();
});
