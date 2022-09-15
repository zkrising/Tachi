import { ServerConfig } from "lib/setup/config";
import t from "tap";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/games/bms/7K/content/sieglindeEC", (t) => {
	t.test("html compatibility return should point to the right file", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeEC");

		const content = /<meta\s+name="bmstable"\s+content="(.*)">/u.exec(res.text);

		if (content) {
			const maybeMatch = content[1];

			t.equal(
				maybeMatch,
				`${ServerConfig.OUR_URL}/api/v1/games/bms/7K/content/sieglindeEC/header.json`
			);
		} else {
			t.fail(`Didn't match regexp for having a bmstable header?`);
		}

		t.end();
	});

	t.test("Should point to the right file.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeEC/header.json");

		t.equal(
			res.body.data_url,
			`${ServerConfig.OUR_URL}/api/v1/games/bms/7K/content/sieglindeEC/body.json`
		);

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

		t.equal(
			res.body.data_url,
			`${ServerConfig.OUR_URL}/api/v1/games/bms/7K/content/sieglindeHC/body.json`
		);

		t.end();
	});
	t.test("`body.json` should return an array.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/content/sieglindeHC/body.json");

		t.equal(Array.isArray(res.body), true);

		t.end();
	});

	t.end();
});
