import t from "tap";
import db from "../../../../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../../../../test-utils/resets";
import {
	ScoreDocument,
	UserGoalDocument,
	GoalDocument,
	MilestoneDocument,
	UserMilestoneDocument,
} from "tachi-common";
import {
	GetKTDataJSON,
	LoadTachiIIDXData,
	Testing511Song,
	Testing511SPA,
	TestingIIDXSPScore,
	TestingIIDXSPScorePB,
} from "../../../../../../../../../test-utils/test-data";
import deepmerge from "deepmerge";

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
					ranking: 1,
					outOf: 1,
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
		] as ScoreDocument[]);

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
					ranking: 1,
					outOf: 1,
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
				ranking: 5,
				playcount: 100,
				classes: {},
				ratings: {},
				timestamp: 1234,
			},
		]);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/history");

		res.body.body[1].timestamp = Math.floor(res.body.body[1].timestamp / 100_000); // by default, it's set to the current time. we can't
		// test that nicely, so lets round it to the nearest 100 seconds.

		t.strictSame(res.body.body, [
			{
				ranking: 5,
				playcount: 100,
				classes: {},
				ratings: {},
				timestamp: 1234,
			},
			{
				ranking: 1,
				playcount: 1,
				classes: {},
				ratings: {},
				// close enough, right?
				timestamp: Math.floor(Date.now() / 100_000),
			},
		]);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/goals", (t) => {
	t.beforeEach(ResetDBState);

	t.test(
		"Should return all of a users goals, and only unachieved goals if the argument is set.",
		async (t) => {
			await db["user-goals"].insert([
				{
					goalID: "foo",
					userID: 1,
					game: "iidx",
					playtype: "SP",
					achieved: false,
				},
				{
					goalID: "bar",
					userID: 1,
					game: "iidx",
					playtype: "SP",
					achieved: true,
				},
			] as UserGoalDocument[]);

			await db.goals.insert([{ goalID: "foo" }, { goalID: "bar" }] as GoalDocument[]);

			const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/goals");

			t.hasStrict(res.body, {
				success: true,
				description: "Successfully returned 2 goal(s).",
				body: {
					userGoals: [
						{
							goalID: "foo",
							achieved: false,
						},
						{
							goalID: "bar",
							achieved: true,
						},
					],
					goals: [{ goalID: "bar" }, { goalID: "foo" }],
				},
			});

			const resUnachieved = await mockApi.get(
				"/api/v1/users/1/games/iidx/SP/goals?unachieved=true"
			);

			t.hasStrict(resUnachieved.body, {
				success: true,
				description: "Successfully returned 1 goal(s).",
				body: {
					userGoals: [
						{
							goalID: "foo",
							achieved: false,
						},
					],
					goals: [{ goalID: "foo" }],
				},
			});

			t.end();
		}
	);

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/milestones", (t) => {
	t.beforeEach(ResetDBState);

	t.test(
		"Should return all of a users milestones, and only unachieved milestones if the argument is set.",
		async (t) => {
			await db["user-milestones"].insert([
				{
					milestoneID: "foo",
					userID: 1,
					game: "iidx",
					playtype: "SP",
					achieved: false,
				},
				{
					milestoneID: "bar",
					userID: 1,
					game: "iidx",
					playtype: "SP",
					achieved: true,
				},
			] as UserMilestoneDocument[]);

			await db.milestones.insert([
				{ milestoneID: "foo" },
				{ milestoneID: "bar" },
			] as MilestoneDocument[]);

			const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/milestones");

			t.hasStrict(res.body, {
				success: true,
				description: "Successfully returned 2 milestone(s).",
				body: {
					userMilestones: [
						{
							milestoneID: "foo",
							achieved: false,
						},
						{
							milestoneID: "bar",
							achieved: true,
						},
					],
					milestones: [{ milestoneID: "bar" }, { milestoneID: "foo" }],
				},
			});

			const resUnachieved = await mockApi.get(
				"/api/v1/users/1/games/iidx/SP/milestones?unachieved=true"
			);

			t.hasStrict(resUnachieved.body, {
				success: true,
				description: "Successfully returned 1 milestone(s).",
				body: {
					userMilestones: [
						{
							milestoneID: "foo",
							achieved: false,
						},
					],
					milestones: [{ milestoneID: "foo" }],
				},
			});

			t.end();
		}
	);

	t.end();
});

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

t.teardown(CloseAllConnections);
