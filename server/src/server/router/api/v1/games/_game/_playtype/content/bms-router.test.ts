import t from "tap";
import mockApi from "test-utils/mock-api";

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
