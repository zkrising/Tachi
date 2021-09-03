import db from "external/mongo/db";
import { ServerConfig } from "lib/setup/config";
import { APITokenDocument, OAuth2ApplicationDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

const clientDataset: OAuth2ApplicationDocument[] = [
	{
		author: 1,
		clientID: "CLIENT_1",
		clientSecret: "SECRET_1",
		name: "foo",
		redirectUri: "example.com",
		requestedPermissions: ["customise_profile"],
	},
	{
		author: 1,
		clientID: "CLIENT_2",
		clientSecret: "SECRET_2",
		name: "bar",
		redirectUri: "example.com",
		requestedPermissions: ["customise_profile"],
	},
	{
		author: 2,
		clientID: "CLIENT_3",
		clientSecret: "SECRET_3",
		name: "baz",
		redirectUri: "example.com",
		requestedPermissions: ["customise_profile"],
	},
];

t.test("GET /api/v1/oauth/clients", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["oauth2-clients"].remove({});
		await db["oauth2-clients"].insert(clientDataset);
	});

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should retrieve your clients.", async (t) => {
		const res = await mockApi.get("/api/v1/oauth/clients").set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		// note: force sort alphabetically so this isn't dependent on
		// mongodb natural order.
		t.strictSame(
			res.body.body.sort((a: any, b: any) => a.name - b.name),
			[
				{
					author: 1,
					clientID: "CLIENT_1",
					clientSecret: "SECRET_1",
					name: "foo",
					redirectUri: "example.com",
					requestedPermissions: ["customise_profile"],
				},
				{
					author: 1,
					clientID: "CLIENT_2",
					clientSecret: "SECRET_2",
					name: "bar",
					redirectUri: "example.com",
					requestedPermissions: ["customise_profile"],
				},
			]
		);

		t.end();
	});

	t.test("Requires self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/oauth/clients");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/oauth/clients")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 401);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/oauth/clients/create", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should create a new client.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "Hello World",
				redirectUri: "https://example.com/callback",
				permissions: ["customise_profile"],
			})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db["oauth2-clients"].findOne({ clientID: res.body.body.clientID });

		t.not(dbRes, null, "Should be saved in the database.");

		t.strictSame(dbRes?.requestedPermissions, ["customise_profile"]);

		t.end();
	});

	t.test("Should validate names to be between 3 and 80 characters.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "2",
				redirectUri: "https://example.com/callback",
				permissions: ["customise_profile"],
			})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "2".repeat(100),
				redirectUri: "https://example.com/callback",
				permissions: ["customise_profile"],
			})
			.set("Cookie", cookie);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.test("Should validate urls to be between 3 and 80 characters.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "Hello World",
				redirectUri: "ftp://example.com/callback",
				permissions: ["customise_profile"],
			})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should validate permissions.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "Hello World",
				redirectUri: "http://example.com/callback",
				permissions: ["permission_that_doesnt_exist"],
			})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should cap a user at OAUTH_CLIENT_CAP.", async (t) => {
		for (let i = 0; i < ServerConfig.OAUTH_CLIENT_CAP; i++) {
			// eslint-disable-next-line no-await-in-loop
			await mockApi
				.post("/api/v1/oauth/clients/create")
				.send({
					name: "Hello World",
					redirectUri: "https://example.com/callback",
					permissions: ["customise_profile"],
				})
				.set("Cookie", cookie);
		}

		const res = await mockApi
			.post("/api/v1/oauth/clients/create")
			.send({
				name: "Hello World",
				redirectUri: "https://example.com/callback",
				permissions: ["customise_profile"],
			})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		const dbCount = await db["oauth2-clients"].count({ author: 1 });

		t.equal(dbCount, ServerConfig.OAUTH_CLIENT_CAP);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/oauth/clients/:clientID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return information about the client at that ID.", async (t) => {
		const res = await mockApi.get("/api/v1/oauth/clients/OAUTH2_CLIENT_ID");

		t.strictSame(res.body.body, {
			clientID: "OAUTH2_CLIENT_ID",
			// clientSecret: "OAUTH2_CLIENT_SECRET", MUST NOT have secret!
			name: "Test_Service",
			author: 1,
			requestedPermissions: ["customise_profile"],
			redirectUri: "https://example.com/callback",
		});

		t.end();
	});

	t.test("Should return 404 if client doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/oauth/clients/BAD_CLIENT");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/oauth/clients/:clientID", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["oauth2-clients"].remove({});
		await db["oauth2-clients"].insert(clientDataset);
	});

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should be able to modify a clients name.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/oauth/clients/CLIENT_1")
			.send({ name: "NEW NAME" })
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.equal(res.body.body.name, "NEW NAME");

		const dbRes = await db["oauth2-clients"].findOne({
			clientID: "CLIENT_1",
		});

		t.equal(dbRes?.name, "NEW NAME");

		t.end();
	});

	t.test("Must validate name to be between 3 and 80 characters.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/oauth/clients/CLIENT_1")
			.send({ name: "2" })
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi
			.patch("/api/v1/oauth/clients/CLIENT_1")
			.send({ name: "2".repeat(100) })
			.set("Cookie", cookie);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.test("Must provide name to modify.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/oauth/clients/CLIENT_1")
			.send({})
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Must be owner of client.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/oauth/clients/CLIENT_3")
			.send({ name: "foo" })
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		const res2 = await mockApi.patch("/api/v1/oauth/clients/CLIENT_3").send({ name: "foo" });

		t.equal(res2.statusCode, 401);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/oauth/clients/:clientID/reset-secret", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["oauth2-clients"].remove({});
		await db["oauth2-clients"].insert(clientDataset);
	});

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should reset the client's secret.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/CLIENT_1/reset-secret")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.not(res.body.body.clientSecret, "SECRET_1", "Should return the new secret.");

		const dbRes = await db["oauth2-clients"].findOne({
			clientID: "CLIENT_1",
		});

		t.not(dbRes?.clientSecret, "SECRET_1", "Should change secret to anything else.");

		t.end();
	});

	t.test("Must be owner of client.", async (t) => {
		const res = await mockApi
			.post("/api/v1/oauth/clients/CLIENT_3/reset-secret")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		const res2 = await mockApi.post("/api/v1/oauth/clients/CLIENT_3/reset-secret");

		t.equal(res2.statusCode, 401);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/oauth/clients/:clientID", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["oauth2-clients"].remove({});
		await db["oauth2-clients"].insert(clientDataset);
	});

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should destroy the client and all associated api keys.", async (t) => {
		await db["api-tokens"].insert([
			{
				fromOAuth2Client: "CLIENT_1",
				token: "foo",
				userID: 1,
			},
			{
				fromOAuth2Client: "CLIENT_1",
				token: "bar",
				userID: 1,
			},
		] as APITokenDocument[]);

		const res = await mockApi.delete("/api/v1/oauth/clients/CLIENT_1").set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db["oauth2-clients"].findOne({ clientID: "CLIENT_1" });

		t.equal(dbRes, null, "Should no longer exist.");

		const dbCount = await db["api-tokens"].count({ fromOAuth2Client: "CLIENT_1" });

		t.equal(dbCount, 0, "Should have destroyed all related api tokens.");

		t.end();
	});

	t.test("Must be owner of client.", async (t) => {
		const res = await mockApi.delete("/api/v1/oauth/clients/CLIENT_3").set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		const res2 = await mockApi.delete("/api/v1/oauth/clients/CLIENT_3");

		t.equal(res2.statusCode, 401);

		t.end();
	});

	t.end();
});
