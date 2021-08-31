import db from "external/mongo/db";
import t from "tap";
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

t.test("PATCH /api/v1/users/:userID/settings", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["api-tokens"].insert({
			identifier: "foo",
			permissions: {
				customise_profile: true,
			},
			token: "foo",
			userID: 1,
		});
	});

	t.test("Should mutate the users settings.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer foo")
			.send({
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
		const res = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer foo")
			.send({});

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
		const res = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer foo")
			.send({
				developerMode: "true",
			});

		t.equal(res.statusCode, 400);

		const res2 = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer foo")
			.send({
				invalid_prop: true,
			});

		t.equal(res2.statusCode, 400);

		const res3 = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer foo")
			.send({
				invisible: { $where: "alert(1)" },
			});

		t.equal(res3.statusCode, 400);

		t.end();
	});

	t.test("Must be authenticated as that user.", async (t) => {
		await db["api-tokens"].insert({
			identifier: "not user1",
			permissions: {
				customise_profile: true,
			},
			token: "not_user1",
			userID: 2,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/settings")
			.set("Authorization", "Bearer not_user1")
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

	t.test("Must have the customise_profile permission.", async (t) => {
		await db["api-tokens"].insert({
			identifier: "no perm",
			permissions: {},
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
