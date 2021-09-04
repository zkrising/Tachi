import db from "external/mongo/db";
import { PublicUserDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/integrations/fervidex/s", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return null if this user has no settings set.", async (t) => {
		await db["fer-settings"].remove({});

		const res = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/settings")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.equal(res.body.body, null);

		t.end();
	});

	t.test("Should return this users settings if they have them.", async (t) => {
		await db["fer-settings"].update({ userID: 1 }, { $set: { cards: ["foo", "bar"] } });

		const res = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/settings")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, {
			userID: 1,
			forceStaticImport: false,
			cards: ["foo", "bar"],
		});

		t.end();
	});

	t.test("Must require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/integrations/fervidex/settings");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/settings")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		// insert a fake user doc so this doesn't 404
		await db.users.insert({
			id: 2,
			username: "foo",
			usernameLowercase: "foo",
		} as PublicUserDocument);

		const res3 = await mockApi
			.get("/api/v1/users/2/integrations/fervidex/settings")
			.set("Cookie", cookie);

		t.equal(res3.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID/integrations/fervidex/settings", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should update a users settings.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/integrations/fervidex/settings")
			.send({
				cards: ["foo", "bar"],
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body.cards, ["foo", "bar"]);

		const dbRes = await db["fer-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, ["foo", "bar"]);

		t.end();
	});

	t.test("Should insert a setting filter document if one doesn't exist.", async (t) => {
		await db["fer-settings"].remove({});

		const res = await mockApi
			.patch("/api/v1/users/1/integrations/fervidex/settings")
			.send({
				cards: ["foo", "bar"],
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body.cards, ["foo", "bar"]);

		const dbRes = await db["fer-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, ["foo", "bar"]);

		t.end();
	});

	t.test("Should null settings if null is provided.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1/integrations/fervidex/settings")
			.send({
				cards: null,
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body.cards, null);

		const dbRes = await db["fer-settings"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, null);

		t.end();
	});

	t.end();
});
