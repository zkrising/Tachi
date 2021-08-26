import db from "external/mongo/db";
import { ScoreDocument } from "tachi-common";
import t from "tap";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	Testing511SPA,
	Testing511Song,
	LoadTachiIIDXData,
	GetKTDataJSON,
} from "test-utils/test-data";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/scores/recent", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a users 100 most recent scores.", async (t) => {
		const mockScores: ScoreDocument[] = [];

		for (let i = 0; i < 200; i++) {
			mockScores.push({
				userID: 1,
				game: "iidx",
				playtype: "SP",
				timeAchieved: i * 100,
				scoreID: `scoreID_${i}`,
				chartID: Testing511SPA.chartID,
				songID: Testing511Song.id,
			} as ScoreDocument);
		}

		await db.scores.insert(mockScores);

		for (const sc of mockScores) {
			delete sc._id; // lol
		}

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/scores/recent");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 scores.",
			body: {
				scores: mockScores.slice(100).reverse(),
				songs: [Testing511Song],
				charts: [Testing511SPA],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/scores", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/scores");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/scores?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		// evil eval attempts
		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/scores?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's scores.", async (t) => {
		const mockScores: ScoreDocument[] = [];

		const charts = GetKTDataJSON("./tachi/tachi-charts-iidx.json");

		for (let i = 0; i < 200; i++) {
			mockScores.push({
				scoreID: i.toString(),
				userID: 1,
				game: "iidx",
				playtype: "SP",
				isPrimary: true,
				chartID: charts[i].chartID,
				songID: charts[i].songID,
				calculatedData: {
					ktRating: i,
				},
			} as ScoreDocument);
		}

		await db.scores.insert(mockScores);

		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/scores?search=5.1.1."
		);

		t.equal(res.body.body.scores.length, 3);
		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.charts.length, 2);

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 3 scores.",
			body: {
				scores: [
					{
						songID: 1,
					},
					{
						songID: 1,
					},
					{
						songID: 1,
					},
				],
				songs: [
					{
						title: "5.1.1.",
					},
				],
				charts: [
					{
						songID: 1,
					},
					{
						songID: 1,
					},
				],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/scores/:chartID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return a users score history on a given chart.", async (t) => {
		await db.scores.remove({});
		await db.scores.insert([
			{
				chartID: Testing511SPA.chartID,
				userID: 1,
				scoreID: "foo",
			},
			{
				chartID: Testing511SPA.chartID,
				userID: 1,
				scoreID: "bar",
			},
			{
				chartID: Testing511SPA.chartID,
				userID: 2,
				scoreID: "baz",
			},
		] as ScoreDocument[]);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/scores/${Testing511SPA.chartID}`
		);

		const scoreIDs = res.body.body.map((e: ScoreDocument) => e.scoreID);

		t.equal(scoreIDs.length, 2);
		t.ok(scoreIDs.includes("foo"));
		t.ok(scoreIDs.includes("bar"));

		t.end();
	});

	t.test("Should reject a chart that does not exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/scores/CHART_THAT_DOESNT_EXIST`
		);

		t.equal(res.statusCode, 404);
		t.match(res.body.description, /chart does not exist/iu);

		t.end();
	});

	t.end();
});
