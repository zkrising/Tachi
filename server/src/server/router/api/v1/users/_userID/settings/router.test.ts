import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { PrivateUserDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/settings", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the users settings.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/settings");

		t.strictSame(res.body.body, {
			userID: 1,
			preferences: {
				invisible: false,
				developerMode: true,
			},
		});

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID/settings", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should mutate the users settings.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1/settings").set("Cookie", cookie).send({
			developerMode: false,
			invisible: true,
		});

		t.strictSame(res.body.body, {
			userID: 1,
			preferences: {
				invisible: true,
				developerMode: false,
			},
		});

		const dbRes = await db["user-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes, {
			userID: 1,
			preferences: {
				invisible: true,
				developerMode: false,
			},
		});

		t.end();
	});

	t.test("Should 400 if body is empty.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1/settings").set("Cookie", cookie).send({});

		t.equal(res.statusCode, 400);

		const dbRes = await db["user-settings"].findOne({ userID: 1 });

		t.strictSame(
			dbRes,
			{
				userID: 1,
				preferences: {
					invisible: false,
					developerMode: true,
				},
			},
			"User Settings should be unmodified."
		);

		t.end();
	});

	t.test("Should validate input.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1/settings").set("Cookie", cookie).send({
			developerMode: "true",
		});

		t.equal(res.statusCode, 400);

		const res2 = await mockApi.patch("/api/v1/users/1/settings").set("Cookie", cookie).send({
			invalid_prop: true,
		});

		t.equal(res2.statusCode, 400);

		const res3 = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Cookie", cookie)
			.send({
				invisible: { $where: "alert(1)" },
			});

		t.equal(res3.statusCode, 400);

		t.end();
	});

	t.test("Must be authenticated as that user.", async (t) => {
		const user = await db.users.findOne({});
		await db.users.insert(
			deepmerge(user!, {
				id: 2,
				username: "something_else",
				usernameLowercase: "something_else",
			}) as PrivateUserDocument
		);

		const res = await mockApi
			.patch("/api/v1/users/2/settings")
			.set("Cookie", cookie) // this token is for user 1, not 2
			.send({
				developerMode: false,
			});

		t.equal(res.statusCode, 403);

		const dbRes = await db["user-settings"].findOne({ userID: 1 });

		t.equal(
			dbRes?.preferences.developerMode,
			true,
			"Settings should not be modified in the database."
		);

		t.end();
	});

	t.test("Must not work with an API key.", async (t) => {
		await db["api-tokens"].insert({
			identifier: "no perm",
			permissions: {
				// has relevant permissions
				customise_profile: true,
			},
			token: "no_perm",
			userID: 1,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer no_perm")
			.send({
				developerMode: false,
			});

		t.equal(res.statusCode, 403);

		const dbRes = await db["user-settings"].findOne({ userID: 1 });

		t.equal(
			dbRes?.preferences.developerMode,
			true,
			"Settings should not be modified in the database."
		);

		t.end();
	});

	t.test("Must be authenticated.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1/settings").send({
			developerMode: false,
		});

		t.equal(res.statusCode, 401);

		const dbRes = await db["user-settings"].findOne({ userID: 1 });

		t.equal(
			dbRes?.preferences.developerMode,
			true,
			"Settings should not be modified in the database."
		);

		t.end();
	});

	t.end();
});
