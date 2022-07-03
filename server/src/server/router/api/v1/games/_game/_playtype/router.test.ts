import dm from "deepmerge";
import db from "external/mongo/db";
import { GetGamePTConfig } from "tachi-common";
import t from "tap";
import { mkFakeGameStats, mkFakeUser } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { FakeOtherUser } from "test-utils/test-data";
import type { PublicUserDocument, UserGameStats } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype", (t) => {
	t.test("Should return information about the game:playtype.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP");

		t.strictSame(res.body.body.config, GetGamePTConfig("iidx", "SP"));

		t.equal(res.body.body.chartCount, 1);
		t.equal(res.body.body.playerCount, 1);
		t.equal(res.body.body.scoreCount, 1);

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
				},
			},
			{
				userID: 3,
				game: "iidx",
				playtype: "SP",
				ratings: {
					BPI: 50,
				},
			},
		] as Array<UserGameStats>);

		await db.users.insert([
			FakeOtherUser,
			dm(FakeOtherUser, {
				username: "foo",
				usernameLowercase: "foo",
				id: 3,
			}) as PublicUserDocument,
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/leaderboard?alg=BPI");

		t.strictSame(
			res.body.body.gameStats.map((e: UserGameStats) => e.userID),
			[2, 3, 1]
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/players", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.users.insert([
			mkFakeUser(2, { usernameLowercase: "scrimblo" }),
			mkFakeUser(3, { usernameLowercase: "scrimblo_2" }),
			mkFakeUser(4, { usernameLowercase: "scrimblo_3" }),
			mkFakeUser(5, { usernameLowercase: "cloudy" }),
		]);

		await db["game-stats"].insert([
			mkFakeGameStats(2),
			mkFakeGameStats(3, { game: "iidx", playtype: "DP" }),
			mkFakeGameStats(4, { game: "bms", playtype: "7K" }),
			mkFakeGameStats(5),
		]);
	});

	t.test("Should find the users where this game has been played.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/players?search=scrimblo");

		t.hasStrict(res.body.body, [{ id: 2 }]);
		t.equal(res.body.body.length, 1);

		t.end();
	});

	t.test("Should definitely honour the search parameter.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/players?search=nobody");

		t.strictSame(res.body.body, []);

		t.end();
	});

	t.test("Should definitely honour the GPT.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/DP/players?search=scrimblo");

		t.hasStrict(res.body.body, [{ id: 3 }]);
		t.equal(res.body.body.length, 1);

		t.end();
	});

	t.test("Should require the search parameter.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/DP/players");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
