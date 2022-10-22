import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import type { PublicUserDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/integrations/kshook-sv6c/settings", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return null if this user has no settings set.", async (t) => {
		await db["kshook-sv6c-settings"].remove({});

		const res = await mockApi
			.get("/api/v1/users/1/integrations/kshook-sv6c/settings")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.equal(res.body.body, null);

		t.end();
	});

	t.test("Should return this users settings if they have them.", async (t) => {
		const res = await mockApi
			.get("/api/v1/users/1/integrations/kshook-sv6c/settings")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, {
			userID: 1,
			forceStaticImport: true,
		});

		t.end();
	});

	t.test("Must require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/integrations/kshook-sv6c/settings");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/integrations/kshook-sv6c/settings")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		// insert a fake user doc so this doesn't 404
		await db.users.insert({
			id: 2,
			username: "foo",
			usernameLowercase: "foo",
		} as PublicUserDocument);

		const res3 = await mockApi
			.get("/api/v1/users/2/integrations/kshook-sv6c/settings")
			.set("Cookie", cookie);

		t.equal(res3.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID/integrations/kshook-sv6c/settings", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should update a users settings.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/integrations/kshook-sv6c/settings")
			.send({ forceStaticImport: true })
			.set("Cookie", cookie);

		t.strictSame(res.body.body.forceStaticImport, true);

		const dbRes = await db["kshook-sv6c-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes?.forceStaticImport, true);

		t.end();
	});

	t.test("Should insert a setting filter document if one doesn't exist.", async (t) => {
		await db["kshook-sv6c-settings"].remove({});

		const res = await mockApi
			.patch("/api/v1/users/1/integrations/kshook-sv6c/settings")
			.send({ forceStaticImport: true })
			.set("Cookie", cookie);

		t.strictSame(res.body.body.forceStaticImport, true);

		const dbRes = await db["kshook-sv6c-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes?.forceStaticImport, true);

		t.end();
	});

	t.end();
});
