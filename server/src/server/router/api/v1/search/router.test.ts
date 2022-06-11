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
		await db["game-settings"].insert(mkFakeGameSettings(1, "iidx", "SP", { rivals: [] }));

		const res = await mockApi
			.get("/api/v1/search?search=scoobydoo")
			.set("Authorization", "Bearer fake_api_token");

		t.equal(res.body.body.users.length, 1);

		t.equal(res.body.body.users[0].__isRival, true);

		t.end();
	});

	t.test("Should search songs.", async (t) => {
		const res = await mockApi.get("/api/v1/search?search=AA");

		t.strictSame(
			res.body.body.songs.map((e: SongDocument) => e.title),
			["AA", "AA -rebuild-"]
		);

		t.end();
	});

	t.test("Should search charts.", async (t) => {
		const res = await mockApi.get("/api/v1/search?search=AA");

		t.strictSame(
			res.body.body.charts.map((e: ChartDocument) => e.chartID),
			[
				"f50fada294fd94afb48215c172bafcd686abf80d",
				"dc63134bd7da647e67e6074f37179da30739ef62",
				"0f059e53963850860c98298b9b9c25e07c3a35df",
				"0e1fbd5bfe34351cb8c4869eddebc34241ec4546",
				"c873be77d89ae1bc3c1bac75ddf9b2de5a3fe6af",
				"95bd4cfdc20bf8a510abe7fa07fe6bb7393e95ab",
				"45c4c6c8fc966c1456206f713110b463f9bedde2",
				"15c2dc36d57a469ce6e0655ef968528149f08854",
				"557a1536509108ab9a0e146110a3227fc0c5b0aa",
				"294f86a9f4dc7116d82f3d495c5aae59f093030a",
				"fb057b61b91df7fb01027182d3be01aadebcec94",
				"29b8fb636805f70b8918ff4654838b474619154f",
			]
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

t.test("GET /api/v1/search/chart-hash", (t) => {
	const BMS_MD5 = "38616b85332037cc12924f2ae2840262";
	const BMS_SHA2 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";
	const PMS_MD5 = "d1253dd56bb2087d0b0d474f0d562aae";
	const PMS_SHA2 = "a10193f7ae05ce839292dc716f182fda0b1cc6ac5382c2056f37e22ffba87b7d";

	// this is apparantly what our mock data uses.
	const USC_SHA1 = "USC_CHART_HASH";

	t.test("Should return a BMS chart if the MD5 matches.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=${BMS_MD5}`);

		t.equal(res.body.body.charts[0].data.hashMD5, BMS_MD5);
		t.equal(res.body.body.songs[0].game, "bms");

		t.end();
	});

	t.test("Should return a BMS chart if the SHA2 matches.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=${BMS_SHA2}`);

		t.equal(res.body.body.charts[0].data.hashSHA256, BMS_SHA2);
		t.equal(res.body.body.songs[0].game, "bms");

		t.end();
	});

	t.test("Should return a PMS chart if the MD5 matches.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=${PMS_MD5}`);

		t.equal(res.body.body.charts[0].data.hashMD5, PMS_MD5);
		t.equal(res.body.body.songs[0].game, "pms");

		t.end();
	});

	t.test("Should return a PMS chart if the SHA2 matches.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=${PMS_SHA2}`);

		t.equal(res.body.body.charts[0].data.hashSHA256, PMS_SHA2);
		t.equal(res.body.body.songs[0].game, "pms");

		t.end();
	});

	t.test("Should return a USC chart if the SHA1 matches.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=${USC_SHA1}`);

		t.equal(res.body.body.charts[0].data.hashSHA1, USC_SHA1);
		t.equal(res.body.body.songs[0].game, "usc");

		t.end();
	});

	t.test("Should return nothing if the hash matches nothing.", async (t) => {
		const res = await mockApi.get(`/api/v1/search/chart-hash?search=CHART_THAT_DOESNT_EXIST`);

		t.equal(res.body.body.charts.length, 0);
		t.equal(res.body.body.songs.length, 0);

		t.end();
	});

	t.end();
});
