import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";
import { BatchManual, BatchManualScore } from "tachi-common";
import deepmerge from "deepmerge";

t.test("POST /ir/direct-manual/import", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.beforeEach(ResetDBState);

	t.test("Should require submit_score permissions", async (t) => {
		await db["api-tokens"].insert({
			token: "foo",
			identifier: "bar",
			permissions: {
				submit_score: false,
			},
			userID: 1,
			fromAPIClient: null,
		});

		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.success, false);

		t.match(res.body.description, /submit_score/u);

		t.end();
	});

	t.test("Should upload BATCH-MANUAL data from the request body.", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Cookie", cookie)
			.send(GetKTDataJSON("./batch-manual/small-file.json"));

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scoreCount = await db.scores.count({ service: "foobar (DIRECT-MANUAL)" });

		t.equal(scoreCount, 1, "Should import one score.");

		t.end();
	});

	t.test("Should reject invalid BATCH-MANUAL data from the request body.", async (t) => {
		const res = await mockApi.post("/ir/direct-manual/import").set("Cookie", cookie).send({});

		t.equal(res.body.success, false, "Should not be successful");

		t.end();
	});

	t.test("Should require authentication.", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.send(GetKTDataJSON("./batch-manual/small-file.json"));

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should require a valid auth token.", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", "Bearer invalid_token")
			.send(GetKTDataJSON("./batch-manual/small-file.json"));

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.beforeEach(() =>
		db["api-tokens"].insert({
			token: "mock_token",
			fromAPIClient: null,
			identifier: "Mock CHUNITACHI Token",
			permissions: { submit_score: true },
			userID: 1,
		})
	);

	const chunitachiBody = GetKTDataJSON("./batch-manual/chunitachi.json");

	t.test("Should work for CHUNITACHI requests", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", `Bearer mock_token`)
			.send(chunitachiBody);

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scoreCount = await db.scores.count({ service: "ChunItachi (DIRECT-MANUAL)" });

		t.equal(scoreCount, 1, "Should import one score.");

		t.end();
	});

	t.test("Should reject invalid batch-manual", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", `Bearer mock_token`)
			.send({});

		t.equal(res.body.success, false, "Should not be successful");

		t.end();
	});

	t.test("Should require authentication.", async (t) => {
		const res = await mockApi.post("/ir/direct-manual/import").send(chunitachiBody);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should require a valid auth token.", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", "Bearer invalid_token")
			.send(chunitachiBody);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("End To End Tests", async (t) => {
		const baseBatchManual: BatchManual = {
			meta: {
				game: "iidx",
				playtype: "SP",
				service: "Foo",
			},
			scores: [],
		};

		const batchManual: BatchManual = {
			meta: {
				game: "iidx",
				playtype: "SP",
				service: "Foo",
			},
			scores: [
				{
					identifier: "1",
					lamp: "CLEAR",
					matchType: "tachiSongID",
					difficulty: "ANOTHER",
					score: 123,
				},
			],
		};

		t.test("Should reject decimal values for score.", async (t) => {
			const bmScore: BatchManualScore = {
				identifier: "1",
				lamp: "CLEAR",
				matchType: "tachiSongID",
				difficulty: "ANOTHER",
				score: 123.5,
			};

			const res = await mockApi
				.post("/ir/direct-manual/import")
				.set("Authorization", `Bearer mock_token`)
				.send(deepmerge(baseBatchManual, { scores: [bmScore] }));

			t.equal(res.body.success, false, "Should not be successful");
			t.match(
				res.body.description,
				/Invalid BATCH-MANUAL: scores\[0\].score \| Expected a positive integer. \| Received 123\.5/iu
			);

			t.end();
		});

		t.test("Should reject unknown games.", async (t) => {
			const res = await mockApi
				.post("/ir/direct-manual/import")
				.set("Authorization", `Bearer mock_token`)
				.send(deepmerge(baseBatchManual, { meta: { game: "nonsense" } }));

			t.equal(res.body.success, false, "Should not be successful");
			t.match(res.body.description, /Invalid game nonsense/iu);

			t.end();
		});

		t.test("Should reject invalid playtypes.", async (t) => {
			const res = await mockApi
				.post("/ir/direct-manual/import")
				.set("Authorization", `Bearer mock_token`)
				.send(deepmerge(baseBatchManual, { meta: { playtype: "nonsense" } }));

			t.equal(res.body.success, false, "Should not be successful");
			t.match(res.body.description, /Invalid playtype nonsense/iu);

			t.end();
		});

		t.end();
	});

	t.end();
});
