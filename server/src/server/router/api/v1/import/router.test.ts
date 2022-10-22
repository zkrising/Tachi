import db from "external/mongo/db";
import t from "tap";
import { RequireAuthPerms } from "test-utils/api-common";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	GetKTDataBuffer,
	LoadTachiIIDXData,
	TestingIIDXEamusementCSV26,
	TestingIIDXEamusementCSV27,
} from "test-utils/test-data";

t.test("POST /api/v1/import/file", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.beforeEach(ResetDBState);

	RequireAuthPerms("/api/v1/import/file", "submit_score", "POST");

	t.test("file/eamusement-iidx-csv", (t) => {
		t.beforeEach(LoadTachiIIDXData);

		t.test("Mini HV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach(
					"scoreData",
					GetKTDataBuffer("./eamusement-iidx-csv/small-hv-file.csv"),
					"my_csv.csv"
				)
				.field("importType", "file/eamusement-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Mini HV Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 2, "Should have 2 successful scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Valid Rootage CSV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
				.field("importType", "file/eamusement-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Valid Heroic Verse CSV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", TestingIIDXEamusementCSV27, "my_csv.csv")
				.field("importType", "file/eamusement-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.strictSame(res.body.body.errors, [], "Should have 0 failed scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.end();
	});

	// thats right i literally just copied it
	t.test("file/pli-iidx-csv", (t) => {
		t.beforeEach(LoadTachiIIDXData);

		t.test("Mini HV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach(
					"scoreData",
					GetKTDataBuffer("./eamusement-iidx-csv/small-hv-file.csv"),
					"my_csv.csv"
				)
				.field("importType", "file/pli-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Mini HV Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 2, "Should have 2 successful scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Valid Rootage CSV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", TestingIIDXEamusementCSV26, "my_csv.csv")
				.field("importType", "file/pli-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Valid Heroic Verse CSV import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", TestingIIDXEamusementCSV27, "my_csv.csv")
				.field("importType", "file/pli-iidx-csv")
				.field("playtype", "SP");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.end();
	});

	t.test("file/batch-manual", (t) => {
		t.test("Empty import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach(
					"scoreData",
					GetKTDataBuffer("./batch-manual/empty-file.json"),
					"empty-file.json"
				)
				.field("importType", "file/batch-manual");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 0, "Should have 0 successful scores.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Invalid JSON", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", Buffer.from("{invalid JSON"))
				.field("importType", "file/batch-manual");

			t.equal(res.body.success, false, "Should not be successful.");

			t.equal(res.statusCode, 400);

			t.end();
		});

		t.test("Single import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach(
					"scoreData",
					GetKTDataBuffer("./batch-manual/small-file.json"),
					"small-file.json"
				)
				.field("importType", "file/batch-manual");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 1, "Should have 1 successful score.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.test("Single sdvxInGameID import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach(
					"scoreData",
					GetKTDataBuffer("./batch-manual/sdvx-in-game-id.json"),
					"small-file.json"
				)
				.field("importType", "file/batch-manual");

			t.equal(res.body.success, true, "Should be successful.");

			t.equal(res.body.body.errors.length, 0, "Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 1, "Should have 1 successful score.");

			const scoreCount = await db.scores.find({
				scoreID: { $in: res.body.body.scoreIDs },
			});

			t.equal(
				scoreCount.length,
				res.body.body.scoreIDs.length,
				"All returned scoreIDs should be inserted to the DB."
			);

			t.end();
		});

		t.end();
	});

	t.test("file/mer-iidx", (t) => {
		t.beforeEach(LoadTachiIIDXData);

		t.test("Example Import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", GetKTDataBuffer("./mer/base.json"), "base.json")
				.field("importType", "file/mer-iidx");

			t.equal(res.body.success, true, "Should be successful");

			t.equal(res.body.body.errors.length, 0, "Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 3, "Should have 3 successful scores.");

			t.end();
		});

		t.test("Example Import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", GetKTDataBuffer("./mer/large.json"), "base.json")
				.field("importType", "file/mer-iidx");

			t.equal(res.body.success, true, "Should be successful");

			t.equal(res.body.body.errors.length, 0, "Import Should have 0 failed scores.");

			t.equal(res.body.body.scoreIDs.length, 627, "Should have 627 successful scores.");

			t.end();
		});

		t.end();
	});

	t.skip("file/solid-state-squad", (t) => {
		t.beforeEach(LoadTachiIIDXData);

		t.test("Large Import", async (t) => {
			const res = await mockApi
				.post("/api/v1/import/file")
				.set("Cookie", cookie)
				.attach("scoreData", GetKTDataBuffer("./s3/large-example.xml"), "large.xml")
				.field("importType", "file/solid-state-squad");

			t.equal(res.body.success, true, "Should be successful");
			t.equal(res.body.body.scoreIDs.length, null, "Should parse N scores.");

			t.end();
		});

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/import/orphans", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.beforeEach(ResetDBState);

	t.test("Should force a reprocessing of orphan scores.", async (t) => {
		await db["orphan-scores"].insert([
			{
				userID: 1,
				timeInserted: 1000,
				orphanID: "asdf",
				importType: "ir/direct-manual",
				errMsg: "foo",
				context: {
					game: "iidx",
					playtype: "SP",
					service: "foo",
					version: null,
				},
				data: {
					score: 500,
					lamp: "HARD CLEAR",
					matchType: "songTitle",
					identifier: "5.1.1.",
					difficulty: "ANOTHER",
				},
				game: "iidx",
			},
			{
				userID: 1,
				timeInserted: 1000,
				orphanID: "asdf2",
				importType: "ir/direct-manual",
				errMsg: "foo",
				context: {
					game: "iidx",
					playtype: "SP",
					service: "foo",
					version: null,
				},
				data: {
					score: 500,
					lamp: "HARD CLEAR",
					matchType: "songTitle",
					identifier: "TITLE NOBODY WILL USE",
					difficulty: "ANOTHER",
				},
				game: "iidx",
			},
		]);

		const res = await mockApi.post("/api/v1/import/orphans").set("Cookie", cookie);

		t.equal(res.statusCode, 200, "Should return 200.");

		t.equal(res.body.body.success, 1, "Should successfully reprocess one orphan.");
		t.equal(res.body.body.processed, 2, "Should reprocess two orphans.");
		t.equal(res.body.body.failed, 1, "Should fail in de-orphaning one orphan.");

		const dbCount = await db["orphan-scores"].count({});

		t.equal(dbCount, 1, "Should only leave one orphan-score in the database.");

		t.end();
	});

	t.end();
});
