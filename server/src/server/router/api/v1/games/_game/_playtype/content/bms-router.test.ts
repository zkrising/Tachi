import dm from "deepmerge";
import db from "external/mongo/db";
import { GetGamePTConfig } from "tachi-common";
import t from "tap";
import { mkFakeGameStats, mkFakeUser } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { FakeOtherUser } from "test-utils/test-data";
import type { PublicUserDocument, UserGameStats } from "tachi-common";

t.test("GET /api/v1/games/bms/7K/content", (t) => {
	t.test("Should exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content");

		t.equal(res.body.success, true);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/bms/7K/content/sieglindeEC", (t) => {
	t.test("Should point to the right file.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeEC/header.json");

		t.equal(res.body.data_url, "./body.json");

		t.end();
	});

	t.test("`body.json` should return an array.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeEC/body.json");

		t.equal(Array.isArray(res.body), true);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/bms/7K/content/sieglindeHC", (t) => {
	t.test("Should point to the right file.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeHC/header.json");

		t.equal(res.body.data_url, "./body.json");

		t.end();
	});

	t.test("`body.json` should return an array.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeHC/body.json");

		t.equal(Array.isArray(res.body), true);

		t.end();
	});

	t.end();
});
