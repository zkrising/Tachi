import db from "external/mongo/db";
import { PublicUserDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/api-tokens", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["api-tokens"].remove({});
		await db["api-tokens"].insert([
			{
				userID: 1,
				identifier: "foo",
				permissions: {},
				token: "tfoo",
			},
			{
				userID: 1,
				identifier: "bar",
				permissions: {},
				token: "tbar",
			},
			{
				userID: 2,
				identifier: "baz",
				permissions: {},
				token: "tbaz",
			},
		]);
	});

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return this users tokens alone.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/api-tokens").set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		// sort these alphabetically so that strictsame can work properly
		t.strictSame(
			res.body.body.sort((a: any, b: any) => a.identifier - b.identifier),
			[
				{
					userID: 1,
					identifier: "foo",
					permissions: {},
					token: "tfoo",
				},
				{
					userID: 1,
					identifier: "bar",
					permissions: {},
					token: "tbar",
				},
			]
		);

		t.end();
	});

	t.test("Should require authentication as that user.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/api-tokens");

		t.equal(res.statusCode, 401);

		await db.users.insert({
			username: "test",
			usernameLowercase: "test",
			id: 2,
		} as PublicUserDocument);

		const res2 = await mockApi.get("/api/v1/users/2/api-tokens").set("Cookie", cookie);

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/users/:userID/api-tokens/:token", async (t) => {
	t.beforeEach(ResetDBState);
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should delete the cookie at that token.", async (t) => {
		const res = await mockApi
			.delete("/api/v1/users/1/api-tokens/fake_api_token")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db["api-tokens"].findOne({
			token: "fake_api_token",
		});

		t.equal(dbRes, null, "Should delete the token in the database");

		t.end();
	});

	t.test("Returns 404 if token doesn't exist.", async (t) => {
		const res = await mockApi
			.delete("/api/v1/users/1/api-tokens/non_exist_token")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Must return 404 if the token belongs to another user.", async (t) => {
		await db["api-tokens"].insert({
			identifier: "foo",
			permissions: {},
			token: "foo",
			userID: 2,
		});

		const res = await mockApi.delete("/api/v1/users/1/api-tokens/foo").set("Cookie", cookie);

		// so as not to reveal that this token exists.
		t.equal(res.statusCode, 404);

		const dbRes = await db["api-tokens"].findOne({ token: "foo" });

		t.not(dbRes, null, "Should not have deleted the token.");

		t.end();
	});

	t.test("Must require authentication as that user.", async (t) => {
		const res = await mockApi.delete("/api/v1/users/1/api-tokens/foo");

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/api-tokens/create", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should create a new API Key for this user with provided permissions.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/api-tokens/create")
			.set("Cookie", cookie)
			.send({
				identifier: "Hello World",
				permissions: ["submit_score", "customise_profile"],
			});

		t.equal(res.statusCode, 200, "Should return 200.");

		t.hasStrict(
			res.body.body,
			{
				identifier: "Hello World",
				permissions: { submit_score: true, customise_profile: true },
				userID: 1,
				fromAPIClient: undefined,
			},
			"Should return a conforming API Token."
		);

		const dbRes = await db["api-tokens"].findOne({
			identifier: "Hello World",
		});

		t.hasStrict(
			dbRes,
			{
				identifier: "Hello World",
				permissions: { submit_score: true, customise_profile: true },
				userID: 1,
				fromAPIClient: undefined,
			},
			"Should insert a conforming API Token into the database."
		);

		t.end();
	});

	t.test(
		"Should create a new API Key for this user according to an existing clientID.",
		async (t) => {
			const res = await mockApi
				.post("/api/v1/users/1/api-tokens/create")
				.set("Cookie", cookie)
				.send({
					clientID: "OAUTH2_CLIENT_ID",
				});

			t.equal(res.statusCode, 200, "Should return 200.");

			t.hasStrict(
				res.body.body,
				{
					identifier: "Test_Service",
					permissions: { customise_profile: true },
					userID: 1,
					fromAPIClient: "OAUTH2_CLIENT_ID",
				},
				"Should return a conforming API Token, with the permissions from that client."
			);

			const dbRes = await db["api-tokens"].findOne({
				identifier: "Test_Service",
			});

			t.hasStrict(
				dbRes,
				{
					identifier: "Test_Service",
					permissions: { customise_profile: true },
					userID: 1,
					fromAPIClient: "OAUTH2_CLIENT_ID",
				},
				"Should insert a conforming API Token into the database."
			);

			t.end();
		}
	);

	t.test("Should reject requests that use both provided permissions and clientID.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/api-tokens/create")
			.set("Cookie", cookie)
			.send({
				identifier: "Hello World",
				permissions: ["submit_score", "customise_profile"],
				clientID: "OAUTH2_CLIENT_ID",
			});

		t.equal(res.statusCode, 400, "Should return 400.");
		t.match(
			res.body.description,
			/clientID creation and permissions creation at the same time/iu
		);

		t.end();
	});

	t.test("Should reject requests with no provided permissions or clientID.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/api-tokens/create")
			.set("Cookie", cookie)
			.send({
				identifier: "Hello World",
			});

		t.equal(res.statusCode, 400, "Should return 400.");
		t.match(res.body.description, /must specify either clientID or permissions/iu);

		t.end();
	});

	t.test("Should reject invalid permissions.", async (t) => {
		const res = await mockApi
			.post("/api/v1/users/1/api-tokens/create")
			.set("Cookie", cookie)
			.send({
				identifier: "Hello World",
				permissions: ["submit_score", "invalid_permission"],
			});

		t.equal(res.statusCode, 400, "Should return 400.");
		t.match(res.body.description, /invalid permissions/iu);

		t.end();
	});

	t.end();
});
