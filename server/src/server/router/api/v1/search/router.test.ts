import db from "external/mongo/db";
import t from "tap";
import { mkFakeGameSettings, mkFakeUser } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData } from "test-utils/test-data";
import type { ChartDocument, SongDocument } from "tachi-common";

t.test("GET /api/v1/search", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should search users and songs.", async (t) => {
		const res = await mockApi.get("/api/v1/search?search=zkldi");

		t.equal(res.body.body.users.length, 1);

		t.equal(res.body.body.users[0].username, "test_zkldi");
		t.equal(res.body.body.users[0].__isRival, false);

		t.end();
	});

	t.test("Should highlight users as rivals if they're rivals of the requester", async (t) => {
		await db.users.insert(
			mkFakeUser(2, { username: "scoobydoo", usernameLowercase: "scoobydoo" })
		);

		await db["game-settings"].remove({});
		await db["game-settings"].insert(mkFakeGameSettings(1, "iidx", "SP", { rivals: [2] }));

		const res = await mockApi
			.get("/api/v1/search?search=scoobydoo")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res.body.body.users.length, 1);

		t.equal(res.body.body.users[0].__isRival, true);

		t.end();
	});

	t.test("Should reject requests without a query.", async (t) => {
		const res = await mockApi.get("/api/v1/search");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
