import db from "external/mongo/db";
import { ONE_MONTH } from "lib/constants/time";
import { InviteCodeDocument, PublicUserDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/invites", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return all of this users created invites and who used them.", async (t) => {
		await db.users.insert({
			id: 2,
			username: "other_dude",
			usernameLowercase: "other_dude",
		} as PublicUserDocument);

		const res = await mockApi.get("/api/v1/users/1/invites").set("Cookie", cookie);

		t.strictSame(
			(res.body.body.invites as InviteCodeDocument[]).sort(
				(a, b) => a.createdAt - b.createdAt
			),
			[
				{
					code: "example_invite",
					createdBy: 1,
					createdAt: 0,
					consumed: false,
					consumedBy: null,
					consumedAt: null,
				},
				{
					code: "example_consumed_invite",
					createdBy: 1,
					createdAt: 1,
					consumed: true,
					consumedBy: 2,
					consumedAt: 123,
				},
			]
		);

		t.strictSame(res.body.body.consumers, [
			{
				id: 2,
				username: "other_dude",
				usernameLowercase: "other_dude",
			},
		]);

		t.end();
	});

	t.test("Should require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/invites");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/invites")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/invites/limit", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return this users current limit on invites.", async (t) => {
		// because this thing is time-based, we need to make sure
		// this is always relative to right now.

		await db.users.update({ id: 1 }, { $set: { joinDate: Date.now() - ONE_MONTH * 2.5 } });
		const res = await mockApi.get("/api/v1/users/1/invites/limit").set("Cookie", cookie);

		t.equal(res.body.body.invites, 2);
		t.equal(res.body.body.limit, 4);

		t.end();
	});

	t.test("Should require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/invites/limit");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/invites/limit")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/invites/create", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should create a new invite.", async (t) => {
		await db.users.update({ id: 1 }, { $set: { joinDate: Date.now() - ONE_MONTH * 2.5 } });

		const res = await mockApi.post("/api/v1/users/1/invites/create").set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db.invites.findOne({
			code: res.body.body.code,
		});

		t.not(dbRes, null, "Should exist in the database.");

		t.end();
	});

	t.test("Should honor invite limit.", async (t) => {
		await db.invites.remove({});
		// users with less than a month of life in them dont get invites,
		// so this will force an invite limit honor.
		await db.users.update({ id: 1 }, { $set: { joinDate: Date.now() } });

		const res = await mockApi.post("/api/v1/users/1/invites/create").set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should require self-key level authentication.", async (t) => {
		const res = await mockApi.post("/api/v1/users/1/invites/create");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.post("/api/v1/users/1/invites/create")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.end();
});
