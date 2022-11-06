import { MakeScoreImport } from "./score-import";
import db from "external/mongo/db";
import { CDNRetrieve } from "lib/cdn/cdn";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { FakeSmallBatchManual } from "test-utils/test-data";

t.test("#MakeScoreImport", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should successfully import basic things.", async (t) => {
		const res = await MakeScoreImport({
			importID: "mockImportID",
			importType: "ir/direct-manual",
			parserArguments: [FakeSmallBatchManual],
			userID: 1,
			userIntent: true,
		});

		t.hasStrict(res, {
			importID: "mockImportID",
		});

		const dbRes = await db.imports.findOne(
			{ importID: "mockImportID" },
			{ projection: { _id: 0 } }
		);

		delete res._id;

		t.strictSame(res, dbRes, "Import in the database should match the import returned");

		try {
			const cdnRes = await CDNRetrieve("/score-import-input/mockImportID").then((r) =>
				JSON.parse(r.toString("utf-8"))
			);

			t.strictSame(
				cdnRes,
				[
					{
						meta: { game: "iidx", playtype: "SP", service: "foobar" },
						scores: [
							{
								score: 500,
								lamp: "HARD CLEAR",
								matchType: "songTitle",
								identifier: "5.1.1.",
								difficulty: "ANOTHER",
							},
						],
					},
				],
				"Should store import-input on the CDN."
			);
		} catch (err) {
			t.fail(err as any);
		}

		const importTrack = await db["import-trackers"].findOne({ importID: "mockImportID" });

		t.equal(
			importTrack,
			null,
			"There should be no import-tracker defined in the database, as the import 'mockImportID' was successful."
		);

		t.end();
	});

	t.end();
});
