import t from "tap";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { BMSGazerChart, LoadTachiIIDXData } from "test-utils/test-data";
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

t.test("GET /api/v1/search/chart-hash", (t) => {
	const BMS_MD5 = "38616b85332037cc12924f2ae2840262";
	const BMS_SHA2 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";
	const PMS_MD5 = "d1253dd56bb2087d0b0d474f0d562aae";
	const PMS_SHA2 = "a10193f7ae05ce839292dc716f182fda0b1cc6ac5382c2056f37e22ffba87b7d";
	const USC_SHA1 = "USC_CHART_HASH"; // this is apparantly what our mock data uses.

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
