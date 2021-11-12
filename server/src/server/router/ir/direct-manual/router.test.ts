import deepmerge from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { GetKTDataJSON } from "test-utils/test-data";

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

	const chunitachiBody = GetKTDataJSON("./batch-manual/chunitachi.json");

	t.test("Should work for CHUNITACHI requests", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", `Bearer mock_token`)
			.send(chunitachiBody);

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scoreCount = await db.scores.count({ service: "ChunItachi" });

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

	t.test("Should reject batch-manual requests if game is not chunithm", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", `Bearer mock_token`)
			.send(deepmerge(chunitachiBody, { meta: { game: "iidx" } }));

		t.equal(res.body.success, false, "Should not be successful");

		t.end();
	});

	t.test("Should reject batch-manual requests if service is not Chunitachi", async (t) => {
		const res = await mockApi
			.post("/ir/direct-manual/import")
			.set("Authorization", `Bearer mock_token`)
			.send(deepmerge(chunitachiBody, { meta: { service: "foo bar" } }));

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

	t.end();
});
