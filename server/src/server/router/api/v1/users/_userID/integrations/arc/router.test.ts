import db from "external/mongo/db";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/integrations/arc", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return the current authentication state.", async (t) => {
		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "foobar",
			forImportType: "api/arc-iidx",
		});

		await db["arc-saved-profiles"].insert({
			userID: 2,
			accountID: "barfoo",
			forImportType: "api/arc-sdvx",
		});

		const res = await mockApi.get("/api/v1/users/1/integrations/arc").set("Cookie", cookie);

		t.hasStrict(res.body.body, {
			iidx: { userID: 1, accountID: "foobar", forImportType: "api/arc-iidx" },
			sdvx: null,
		});

		t.end();
	});

	t.test("Should reject APIKey authentication.", async (t) => {
		await db["api-tokens"].insert({
			identifier: "foobar",
			permissions: {},
			token: "foobar",
			userID: 1,
		});

		const res = await mockApi
			.get("/api/v1/users/1/integrations/arc")
			.set("Authorization", "Bearer foobar");

		t.equal(res.statusCode, 403);
		t.match(res.body.description, /this request cannot be performed by an api key/iu);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID/integrations/arc", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should update a users configured accountIDs.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/integrations/arc")
			.set("Cookie", cookie)
			.send({
				iidx: "newAccountID",
			});

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			iidx: {
				accountID: "newAccountID",
				userID: 1,
				forImportType: "api/arc-iidx",
			},
			sdvx: null,
		});

		const dbRes = await db["arc-saved-profiles"].findOne({
			userID: 1,
			forImportType: "api/arc-iidx",
		});

		t.strictSame(dbRes, {
			accountID: "newAccountID",
			userID: 1,
			forImportType: "api/arc-iidx",
		});

		t.end();
	});

	t.test("Should update accountIDs if one already exists", async (t) => {
		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "OLD_ACCOUNT_ID",
			forImportType: "api/arc-iidx",
		});

		const res = await mockApi
			.patch("/api/v1/users/1/integrations/arc")
			.set("Cookie", cookie)
			.send({
				iidx: "newAccountID",
			});

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			iidx: {
				accountID: "newAccountID",
				userID: 1,
				forImportType: "api/arc-iidx",
			},
			sdvx: null,
		});

		const dbRes = await db["arc-saved-profiles"].findOne({
			userID: 1,
			forImportType: "api/arc-iidx",
		});

		t.strictSame(dbRes, {
			accountID: "newAccountID",
			userID: 1,
			forImportType: "api/arc-iidx",
		});

		t.end();
	});

	t.test("Should remove accountIDs if nulled", async (t) => {
		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "OLD_ACCOUNT_ID",
			forImportType: "api/arc-iidx",
		});

		const res = await mockApi
			.patch("/api/v1/users/1/integrations/arc")
			.set("Cookie", cookie)
			.send({
				iidx: null,
			});

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			iidx: null,
			sdvx: null,
		});

		const dbRes = await db["arc-saved-profiles"].findOne({
			userID: 1,
			forImportType: "api/arc-iidx",
		});

		t.equal(dbRes, null);

		t.end();
	});

	t.test("Should reject requests with no modifications", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/integrations/arc")
			.set("Cookie", cookie)
			.send({});

		t.equal(res.statusCode, 400);
		t.match(res.body.description, "Invalid request to modify nothing.");

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
