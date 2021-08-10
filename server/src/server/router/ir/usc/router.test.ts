import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState, { ResetCDN } from "test-utils/resets";
import deepmerge from "deepmerge";
import { PBScoreDocument, ScoreDocument, PrivateUserDocument } from "tachi-common";
import { GetKTDataBuffer } from "test-utils/test-data";
import { CDNRetrieve } from "lib/cdn/cdn";

async function InsertFakeUSCAuth() {
	await db["api-tokens"].insert({
		userID: 1,
		identifier: "USC Token",
		permissions: {
			submit_score: true,
		},
		token: "foo",
	});
}

function TestAuth(url: string) {
	t.test(`Authorization Check ${url}`, async (t) => {
		const res = await mockApi.get(url).set("Authorization", "Bearer invalid");

		t.equal(res.body.statusCode, 41, "Should return 41 for nonsense token");

		const res2 = await mockApi.get(url).set("Authorization", "NOTBEARER invalid");

		t.equal(res2.body.statusCode, 40, "Should return 40 for nonsense authtype");

		const res3 = await mockApi.get(url);

		t.equal(res3.body.statusCode, 40, "Should return 40 for no auth header.");

		const res4 = await mockApi.get(url).set("Authorization", "Bearer foo invalid");

		t.equal(res4.body.statusCode, 40, "Should return 40 for nonsense header");
	});
}

t.test("GET /ir/usc", async (t) => {
	await db["api-tokens"].insert({
		userID: 1,
		identifier: "USC Token",
		permissions: {
			submit_score: true,
		},
		token: "foo",
	});

	t.beforeEach(ResetDBState);

	TestAuth("/ir/usc");

	const res = await mockApi.get("/ir/usc").set("Authorization", "Bearer foo");

	t.equal(res.body.statusCode, 20, "Should return 20");
	t.match(
		res.body.body,
		{
			serverName: /tachi/iu,
			irVersion: /^[0-9]\.[0-9]\.[0-9](-a)?$/iu,
		},
		"Should return the right body."
	);

	t.end();
});

t.test("GET /ir/usc/charts/:chartHash", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeUSCAuth);

	t.test("Should return 20 if the chartHash matches a chart.", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 20, "Should return 20");

		t.end();
	});

	t.test("Should return 42 if the chartHash doesn't match a chart.", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/INVALID_HASH")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 42, "Should return 42");

		t.end();
	});

	t.end();
});

const USC_SCORE_PB: PBScoreDocument = {
	chartID: "USC_CHART_ID",
	rankingData: {
		rank: 1,
		outOf: 2,
	},
	songID: 1,
	userID: 1,
	timeAchieved: 0,
	playtype: "Single",
	game: "usc",
	highlight: false,
	composedFrom: {
		scorePB: "usc_score_pb",
		lampPB: "bar",
	},
	calculatedData: {
		VF6: null,
	},
	isPrimary: true,
	scoreData: {
		score: 9_000_000,
		percent: 90,
		grade: "A+",
		esd: null,
		lamp: "EXCESSIVE CLEAR",
		lampIndex: 2,
		gradeIndex: 4, // idk, lazy
		judgements: {
			critical: 50,
			near: 30,
			miss: 10,
		},
		hitMeta: {
			gauge: 50,
		},
	},
};

t.test("GET /ir/usc/:chartHash/record", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeUSCAuth);
	TestAuth("/ir/usc/:chartHash/record");

	t.test("Should return 42 if the chartHash doesn't match a chart.", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/INVALID_HASH/record")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 42, "Should return 42");

		t.end();
	});

	t.test("Should return 44 if there are no scores on the chart.", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/record")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 44, "Should return 42");

		t.end();
	});

	t.test("Should return 20 and the Server Record.", async (t) => {
		await db["personal-bests"].insert([
			// empty deepmerge is because monk monkey-patches _id on,
			// which means this crashes if you try to re-insert this document.
			deepmerge(USC_SCORE_PB, {}),
			deepmerge(USC_SCORE_PB, { userID: 2, rankingData: { rank: 2 } }),
		]);

		// hack for referencing
		await db.scores.insert({
			scoreID: "usc_score_pb",
			scoreMeta: { noteMod: "NORMAL", gaugeMod: "HARD" },
		} as ScoreDocument);

		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/record")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 20, "Should return 20");

		t.strictSame(
			res.body.body,
			{
				score: 9_000_000,
				timestamp: 0,
				crit: 50,
				near: 30,
				error: 10,
				ranking: 1,
				lamp: 3,
				username: "test_zkldi",
				noteMod: "NORMAL",
				gaugeMod: "HARD",
			},
			"Should correctly return the right score."
		);

		t.end();
	});

	t.end();
});

t.test("GET /charts/:chartHash/leaderboard", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeUSCAuth);
	TestAuth("/ir/usc/:chartHash/leaderboard");

	t.test("Should return 40 if mode is invalid", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 40);

		const res2 = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=invalid")
			.set("Authorization", "Bearer foo");

		t.equal(res2.body.statusCode, 40);

		t.end();
	});

	t.test("Should return 40 if N is invalid", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=best")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 40);

		const res2 = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=best&n=foo")
			.set("Authorization", "Bearer foo");

		t.equal(res2.body.statusCode, 40);

		t.end();
	});

	t.test("Should return empty arr for mode = best if no scores", async (t) => {
		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=best&n=5")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 20);

		t.end();
	});

	t.test("Should return scorePBs for mode = best", async (t) => {
		await db["personal-bests"].insert([
			deepmerge(USC_SCORE_PB, {}),
			deepmerge(USC_SCORE_PB, {
				userID: 2,
				scoreData: {
					score: 8_000_000,
					percent: 80,
				},
				rankingData: { rank: 2 },
				composedFrom: { scorePB: "other_usc_score_pb" },
			}),
		]);

		await db.users.insert({
			id: 2,
			username: "not_zkldi",
		} as PrivateUserDocument);

		await db.scores.insert([
			{
				scoreID: "usc_score_pb",
				scoreMeta: { noteMod: "NORMAL", gaugeMod: "HARD" },
			},
			{
				scoreID: "other_usc_score_pb",
				scoreMeta: { noteMod: "NORMAL", gaugeMod: "HARD" },
			},
		] as ScoreDocument[]);

		const res = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=best&n=2")
			.set("Authorization", "Bearer foo");

		t.equal(res.body.statusCode, 20);
		t.strictSame(
			res.body.body,
			[
				{
					score: 9000000,
					timestamp: 0,
					crit: 50,
					near: 30,
					error: 10,
					ranking: 1,
					lamp: 3,
					username: "test_zkldi",
					noteMod: "NORMAL",
					gaugeMod: "HARD",
				},
				{
					score: 8000000,
					timestamp: 0,
					crit: 50,
					near: 30,
					error: 10,
					ranking: 2,
					lamp: 3,
					username: "not_zkldi",
					noteMod: "NORMAL",
					gaugeMod: "HARD",
				},
			],
			"Should return the scores."
		);

		const res2 = await mockApi
			.get("/ir/usc/charts/USC_CHART_HASH/leaderboard?mode=best&n=1")
			.set("Authorization", "Bearer foo");

		t.equal(res2.body.statusCode, 20);
		t.strictSame(
			res2.body.body,
			[
				{
					score: 9000000,
					timestamp: 0,
					crit: 50,
					near: 30,
					error: 10,
					ranking: 1,
					lamp: 3,
					username: "test_zkldi",
					noteMod: "NORMAL",
					gaugeMod: "HARD",
				},
			],
			"Should return the scores dependent on N."
		);

		t.end();
	});

	t.end();
});

t.test("POST /replays", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(ResetCDN);
	t.beforeEach(InsertFakeUSCAuth);

	t.test("Should successfully upload a file where an identifier matches", async (t) => {
		await db.scores.insert({
			game: "usc",
			userID: 1,
			scoreID: "MOCK_IDENTIFIER",
		} as ScoreDocument);

		const replayFile = GetKTDataBuffer("./usc/replayfile.urf");

		const res = await mockApi
			.post("/ir/usc/replays")
			.field("identifier", "MOCK_IDENTIFIER")
			.attach("replay", replayFile, "replay.urf")
			.set("Authorization", "Bearer foo");

		t.equal(res.status, 200);

		t.strictSame(res.body, {
			statusCode: 20,
			description: "Saved replay.",
			body: null,
		});

		const stored = await CDNRetrieve("/uscir/replays/MOCK_IDENTIFIER");

		t.strictSame(stored, replayFile, "Should store the same file exactly.");

		t.end();
	});

	t.test("Should reject a request with no identifier", async (t) => {
		await db.scores.insert({
			game: "usc",
			userID: 1,
			scoreID: "MOCK_IDENTIFIER",
		} as ScoreDocument);

		const replayFile = GetKTDataBuffer("./usc/replayfile.urf");

		const res = await mockApi
			.post("/ir/usc/replays")
			.attach("replay", replayFile, "replay.urf")
			.set("Authorization", "Bearer foo");

		t.equal(res.status, 200);

		t.strictSame(res.body, {
			statusCode: 40,
			description: "No Identifier Provided.",
		});

		t.end();
	});

	t.test("Should reject a request with no file", async (t) => {
		await db.scores.insert({
			game: "usc",
			userID: 1,
			scoreID: "MOCK_IDENTIFIER",
		} as ScoreDocument);

		// const replayFile = GetKTDataBuffer("./usc/replayfile.urf");

		const res = await mockApi
			.post("/ir/usc/replays")
			.field("identifier", "MOCK_IDENTIFIER")
			// .attach("replay", replayFile, "replay.urf")
			.set("Authorization", "Bearer foo");

		t.equal(res.status, 200);

		t.strictSame(res.body, {
			statusCode: 40,
			description: "No File Provided.",
		});

		t.end();
	});

	t.test("Should reject a request with an invalid identifier", async (t) => {
		await db.scores.insert({
			game: "usc",
			userID: 1,
			scoreID: "MOCK_IDENTIFIER",
		} as ScoreDocument);

		const replayFile = GetKTDataBuffer("./usc/replayfile.urf");

		const res = await mockApi
			.post("/ir/usc/replays")
			.field("identifier", "INVALID_IDENTIFIER")
			.attach("replay", replayFile, "replay.urf")
			.set("Authorization", "Bearer foo");

		t.equal(res.status, 200);

		t.strictSame(res.body, {
			statusCode: 44,
			description: "No score corresponds to this identifier.",
		});

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
