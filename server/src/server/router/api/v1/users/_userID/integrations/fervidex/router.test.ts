import db from "external/mongo/db";
import { PublicUserDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/integrations/fervidex/card", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return null if this user has cards set to null.", async (t) => {
		const res = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/cards")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.equal(res.body.body, null);

		t.end();
	});

	t.test("Should return null if this user has no cards set.", async (t) => {
		await db["fer-cards"].remove({});

		const res = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/cards")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.equal(res.body.body, null);

		t.end();
	});

	t.test("Should return this users list of cards if they have some set.", async (t) => {
		await db["fer-cards"].update({ userID: 1 }, { $set: { cards: ["foo", "bar"] } });

		const res = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/cards")
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, ["foo", "bar"]);

		t.end();
	});

	t.test("Must require self-key level authentication.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/integrations/fervidex/cards");

		t.equal(res.statusCode, 401);

		const res2 = await mockApi
			.get("/api/v1/users/1/integrations/fervidex/cards")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res2.statusCode, 403);

		// insert a fake user doc so this doesn't 404
		await db.users.insert({
			id: 2,
			username: "foo",
			usernameLowercase: "foo",
		} as PublicUserDocument);

		const res3 = await mockApi
			.get("/api/v1/users/2/integrations/fervidex/cards")
			.set("Cookie", cookie);

		t.equal(res3.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/integrations/fervidex/cards", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should update a users cards.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/integrations/fervidex/cards")
			.send({
				cards: ["foo", "bar"],
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body, ["foo", "bar"]);

		const dbRes = await db["fer-cards"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, ["foo", "bar"]);

		t.end();
	});

	t.test("Should insert a card filter document if one doesn't exist.", async (t) => {
		await db["fer-cards"].remove({});

		const res = await mockApi
			.put("/api/v1/users/1/integrations/fervidex/cards")
			.send({
				cards: ["foo", "bar"],
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body, ["foo", "bar"]);

		const dbRes = await db["fer-cards"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, ["foo", "bar"]);

		t.end();
	});

	t.test("Should null cards if null is provided.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/integrations/fervidex/cards")
			.send({
				cards: null,
			})
			.set("Cookie", cookie);

		t.strictSame(res.body.body, null);

		const dbRes = await db["fer-cards"].findOne({ userID: 1 });

		t.strictSame(dbRes?.cards, null);

		t.end();
	});

	t.end();
});
