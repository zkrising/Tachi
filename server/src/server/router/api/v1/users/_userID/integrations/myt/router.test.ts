import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import type { UserDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/integrations/myt", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test(
		"Should show user is unauthenticated if they don't have an API token set.",
		async (t) => {
			await db["myt-auth-tokens"].remove({});

			const res = await mockApi.get("/api/v1/users/1/integrations/myt").set("Cookie", cookie);

			t.equal(res.statusCode, 200);

			t.equal(res.body.body.authStatus, false);

			t.end();
		}
	);

	t.test("Should show user is authenticated if they have a token set.", async (t) => {
		await db["myt-auth-tokens"].insert({
			userID: 1,
			token: "foo",
		});

		const res = await mockApi.get("/api/v1/users/1/integrations/myt").set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body.authStatus, true);

		t.end();
	});

	t.test("Must require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/integrations/myt");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/integrations/myt")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		// insert a fake user doc so this doesn't 404
		await db.users.insert({
			id: 2,
			username: "foo",
			usernameLowercase: "foo",
		} as UserDocument);

		const res3 = await mockApi.get("/api/v1/users/2/integrations/myt").set("Cookie", cookie);

		t.equal(res3.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/users/:userID/integrations/myt", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should error if there is no existing MYT integration.", async (t) => {
		const res = await mockApi.delete("/api/v1/users/1/integrations/myt").set("Cookie", cookie);

		t.strictSame(res.statusCode, 409);

		t.end();
	});

	t.test("Should delete MYT integration.", async (t) => {
		await db["myt-auth-tokens"].insert({ userID: 1, token: "foo" });

		const res = await mockApi.delete("/api/v1/users/1/integrations/myt").set("Cookie", cookie);

		t.strictSame(res.statusCode, 200);

		const dbRes = await db["myt-auth-tokens"].findOne({ userID: 1 });

		t.notOk(dbRes);

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/integrations/myt", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should save a provided API token.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/integrations/myt")
			.send({ token: "foo" })
			.set("Cookie", cookie);

		t.strictSame(res.statusCode, 200);

		const dbRes = await db["myt-auth-tokens"].findOne({ userID: 1 });

		t.strictSame(dbRes?.token, "foo");

		t.end();
	});

	t.end();
});
