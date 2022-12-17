import db from "external/mongo/db";
import { ServerConfig } from "lib/setup/config";
import t from "tap";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/games/bms/:playtype/custom-tables/:tableUrlName", async (t) => {
	await db.tables.insert({
		default: false,
		description: "EC difficulties according to Sieglinde.",

		// stubbed folders
		folders: ["sieglinde_folder"],
		game: "bms",
		inactive: false,
		playtype: "7K",
		tableID: "bms-7K-sgl-EC",
		title: "Sieglinde EC",
	});

	await db.folders.insert({
		folderID: "sieglinde_folder",
		game: "bms",
		playtype: "7K",
		inactive: false,
		searchTerms: [],
		title: "Mock Sieglinde Folder",

		// this table contains all charts. silly mock.
		data: {},
		type: "charts",
	});

	t.test("html compatibility return should point to the right file", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/custom-tables/sieglindeEC");

		const content = /<meta\s+name="bmstable"\s+content="(.*)">/u.exec(res.text);

		if (content) {
			const maybeMatch = content[1];

			t.equal(
				maybeMatch,
				`${ServerConfig.OUR_URL}/api/v1/games/bms/7K/custom-tables/sieglindeEC/header.json`
			);
		} else {
			t.fail(`Didn't match regexp for having a bmstable header?`);
		}

		t.end();
	});

	t.test("Should point to the right file.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/custom-tables/sieglindeEC/header.json");

		t.equal(
			res.body.data_url,
			`${ServerConfig.OUR_URL}/api/v1/games/bms/7K/custom-tables/sieglindeEC/body.json`
		);

		t.end();
	});

	t.test("`body.json` should return an array.", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/custom-tables/sieglindeEC/body.json");

		t.equal(Array.isArray(res.body), true);

		t.end();
	});

	t.test("Invalid Table", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/7K/custom-tables/fake-table");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Invalid Playtype", async (t) => {
		const res = await mockApi.get("/api/v1/games/bms/14K/custom-tables/sieglindeEC");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});
