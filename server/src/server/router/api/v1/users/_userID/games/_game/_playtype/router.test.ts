import t from "tap";
import db from "../../../../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../../test-utils/mock-api";
import ResetDBState, { SetIndexesForDB } from "../../../../../../../../../test-utils/resets";
import {
	SessionDocument,
	ScoreDocument,
	UserGoalDocument,
	GoalDocument,
	MilestoneDocument,
	UserMilestoneDocument,
	PBScoreDocument,
} from "tachi-common";
import {
	GetKTDataJSON,
	LoadKTBlackIIDXData,
	Testing511Song,
	Testing511SPA,
} from "../../../../../../../../../test-utils/test-data";

t.before(SetIndexesForDB);

t.test("GET /api/v1/users/:userID/games/:game/:playtype/", (t) => {
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

t.test("GET /api/v1/users/:userID/games/:game/:playtype/pbs/best", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a users best 100 personal bests.", async (t) => {
		const mockPBs: PBScoreDocument[] = [];

		for (let i = 0; i < 200; i++) {
			mockPBs.push({
				userID: 1,
				game: "iidx",
				playtype: "SP",
				isPrimary: true,
				chartID: i.toString(), // hack to generate some random chartIDs
				songID: Testing511Song.id,
				calculatedData: {
					ktRating: i,
				},
			} as PBScoreDocument);
		}

		await db["personal-bests"].insert(mockPBs);

		for (const sc of mockPBs) {
			delete sc._id; // lol
		}

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs/best");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 personal bests.",
			body: {
				scores: mockPBs.slice(100).reverse(),
				songs: [Testing511Song],
				charts: [],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/pbs", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/pbs?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/pbs?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's personal bests.", async (t) => {
		const mockPBs: PBScoreDocument[] = [];

		const charts = GetKTDataJSON("./tachi/ktblack-charts-iidx.json");

		for (let i = 0; i < 200; i++) {
			mockPBs.push({
				userID: 1,
				game: "iidx",
				playtype: "SP",
				isPrimary: true,
				chartID: charts[i].chartID,
				songID: charts[i].songID,
				calculatedData: {
					ktRating: i,
				},
			} as PBScoreDocument);
		}

		await db["personal-bests"].insert(mockPBs);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs?search=5.1.1.");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 2 personal bests.",
			body: {
				pbs: [
					{
						chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					{
						chartID: "c641238220d73faf82659513ba03bde71b0b45f0",
					},
				],
				songs: [
					{
						title: "5.1.1.",
					},
				],
				charts: [
					{
						chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					{
						chartID: "c641238220d73faf82659513ba03bde71b0b45f0",
					},
				],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/scores", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

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

		const charts = GetKTDataJSON("./tachi/ktblack-charts-iidx.json");

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

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		// evil eval attempts
		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's sessions.", async (t) => {
		await db.sessions.insert(
			["Epic Session", "Session Of Epic", "Epic Gaming", "something else", "bad session"].map(
				(e) => ({
					userID: 1,
					game: "iidx",
					playtype: "SP",
					name: e,
					desc: "something",
					sessionID: e, // hack to avoid db nonsense
				})
			) as SessionDocument[]
		);

		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=Epic"
		);

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 3 sessions.",
			body: [],
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions/best", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);

	t.test("Should return a user's best 100 sessions.", async (t) => {
		const sessions: SessionDocument[] = [];

		for (let i = 0; i < 200; i++) {
			sessions.push({
				sessionID: i.toString(),
				game: "iidx",
				playtype: "SP",
				userID: 1,
				calculatedData: {
					ktRating: i,
				},
			} as SessionDocument);
		}

		await db.sessions.remove({});
		await db.sessions.insert(sessions);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions/best");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 sessions.",
		});

		t.strictSame(
			res.body.body.map((e: SessionDocument) => e.sessionID),
			sessions
				.slice(100)
				.reverse()
				.map((e) => e.sessionID)
		);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
