import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingLR2HookScore } from "test-utils/test-data";

t.test("POST /ir/lr2hook/import", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["api-tokens"].insert({
			token: "foo",
			permissions: { submit_score: true },
			fromAPIClient: null,
			identifier: "foo",
			userID: 1,
		});
	});

	t.test("Should import a score if the API token has the right permissions.", async (t) => {
		const res = await mockApi
			.post("/ir/lr2hook/import")
			.set("Authorization", "Bearer foo")
			.send(TestingLR2HookScore);

		t.equal(res.statusCode, 200);

		t.end();
	});

	t.test("Should import a score if the API token has the right permissions.", async (t) => {
		await db["api-tokens"].insert({
			token: "bar",
			permissions: { submit_score: false },
			fromAPIClient: null,
			identifier: "bar",
			userID: 1,
		});

		const res = await mockApi
			.post("/ir/lr2hook/import")
			.set("Authorization", "Bearer bar")
			.send(TestingLR2HookScore);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should import a score if the API token has the right permissions.", async (t) => {
		const res = await mockApi
			.post("/ir/lr2hook/import")
			.set("Authorization", "Bearer unknown token")
			.send(TestingLR2HookScore);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.end();
});
