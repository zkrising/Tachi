import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { ONE_DAY } from "lib/constants/time";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Testing511SPA, TestingIIDXSPScore, TestingIIDXSPScorePB } from "test-utils/test-data";
import type { ScoreDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/games/:game/:playtype", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a users statistics for that game.", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved user statistics for test_zkldi (iidx SP)",
			body: {
				gameStats: {
					userID: 1,
					game: "iidx",
					playtype: "SP",
					classes: {},
					ratings: {},
				},
				firstScore: null,
				mostRecentScore: null,
				totalScores: 1,
				rankingData: {
					ktLampRating: {
						ranking: 1,
						outOf: 1,
					},
					BPI: {
						ranking: 1,
						outOf: 1,
					},
				},
			},
		});

		t.end();
	});

	t.test("Should return a users first score if one exists.", async (t) => {
		await db.scores.insert([
			{
				userID: 1,
				timeAchieved: 100,
				scoreID: "foo",
				game: "iidx",
				playtype: "SP",
			},
			{
				userID: 1,
				timeAchieved: 200,
				scoreID: "bar",
				game: "iidx",
				playtype: "SP",
			},
			{
				userID: 1,
				timeAchieved: 300,
				scoreID: "baz",
				game: "iidx",
				playtype: "SP",
			},
		] as Array<ScoreDocument>);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved user statistics for test_zkldi (iidx SP)",
			body: {
				gameStats: {
					userID: 1,
					game: "iidx",
					playtype: "SP",
					classes: {},
					ratings: {},
				},
				firstScore: {
					timeAchieved: 100,
					scoreID: "foo",
				},
				mostRecentScore: {
					timeAchieved: 300,
					scoreID: "baz",
				},
				totalScores: 4,
				rankingData: {
					ktLampRating: {
						ranking: 1,
						outOf: 1,
					},
					BPI: {
						ranking: 1,
						outOf: 1,
					},
				},
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/history", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a users history snapshots for that gpt.", async (t) => {
		await db["game-stats-snapshots"].insert([
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",

				// @ts-expect-error Too lazy to sort this one out...
				rankings: {
					BPI: {
						ranking: 2,
						outOf: 4,
					},
				},
				playcount: 100,
				classes: {},
				ratings: {},
				timestamp: Date.now() - ONE_DAY,
			},
		]);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/history");

		// by default, it's set to the current time. we can't
		// test that nicely, so lets round it to the nearest 100 seconds.
		res.body.body[0].timestamp = Math.floor(res.body.body[0].timestamp / 100_000);
		res.body.body[1].timestamp = Math.floor(res.body.body[1].timestamp / 100_000);

		t.strictSame(res.body.body, [
			{
				rankings: {
					ktLampRating: {
						ranking: 1,
						outOf: 1,
					},
					BPI: {
						ranking: 1,
						outOf: 1,
					},
				},
				playcount: 1,
				classes: {},
				ratings: {},

				// close enough, right?
				timestamp: Math.floor(Date.now() / 100_000),
			},
			{
				rankings: {
					BPI: {
						ranking: 2,
						outOf: 4,
					},
				},
				playcount: 100,
				classes: {},
				ratings: {},
				timestamp: Math.floor(Date.now() - ONE_DAY / 100_000),
			},
		]);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/most-played", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the users most played scores.", async (t) => {
		await db.scores.insert([
			// @ts-expect-error nonsense
			deepmerge(TestingIIDXSPScore, { scoreID: "something_else" }),

			// @ts-expect-error nonsense
			deepmerge(TestingIIDXSPScore, { scoreID: "something_else2" }),
		]);

		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/most-played");

		t.equal(res.body.body.pbs.length, 1);
		t.equal(res.body.body.pbs[0].__playcount, 3);

		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.songs[0].id, 1);

		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.charts[0].chartID, Testing511SPA.chartID);

		t.end();
	});

	t.end();
});
