import t from "tap";
import mockApi from "test-utils/mock-api";
import { GetGamePTConfig, UserGameStats } from "tachi-common";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";
import db from "external/mongo/db";

t.test("GET /api/v1/games/:game/:playtype", (t) => {
	t.test("Should return information about the game:playtype.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP");

		t.strictSame(res.body.body.config, GetGamePTConfig("iidx", "SP"));

		// something else needs to go here?

		t.end();
	});

	t.test("Should reject invalid playtypes for this game.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/Single");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/leaderboard", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the leaderboards for this game", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/leaderboard");

		t.equal(res.statusCode, 200);

		t.equal(res.body.body.gameStats.length, 1);
		t.equal(res.body.body.users.length, 1);

		t.hasStrict(res.body.body, {
			gameStats: [
				{
					userID: 1,
					game: "iidx",
					playtype: "SP",
				},
			],
			users: [
				{
					id: 1,
				},
			],
		});

		t.end();
	});

	t.test("Should reject unknown alg", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/leaderboard?alg=naiveRating");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should use provided algorithm to resort results.", async (t) => {
		await db["game-stats"].insert([
			{
				userID: 2,
				game: "iidx",
				playtype: "SP",
				ratings: {
					BPI: 100,
					ktRating: 50,
				},
			},
			{
				userID: 3,
				game: "iidx",
				playtype: "SP",
				ratings: {
					BPI: 50,
					ktRating: 100,
				},
			},
		] as UserGameStats[]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/leaderboard?alg=BPI");

		t.strictSame(
			res.body.body.gameStats.map((e: UserGameStats) => e.userID),
			[2, 3, 1]
		);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
