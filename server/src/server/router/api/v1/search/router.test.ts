import t from "tap";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData } from "test-utils/test-data";
import { SongDocument } from "tachi-common";

t.test("GET /api/v1/search", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should search users and songs.", async (t) => {
		const res = await mockApi.get("/api/v1/search?search=zkldi");

		t.equal(res.body.body.users.length, 1);

		t.equal(res.body.body.users[0].username, "test_zkldi");

		t.end();
	});

	t.test("Should search songs.", async (t) => {
		const res = await mockApi.get("/api/v1/search?search=AA");

		t.equal(res.body.body.songs.length, 2);
		t.strictSame(
			res.body.body.songs.map((e: SongDocument) => e.title),
			["AA", "AA -rebuild-"]
		);

		t.end();
	});

	t.test("Should reject requests without a query.", async (t) => {
		const res = await mockApi.get("/api/v1/search");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
