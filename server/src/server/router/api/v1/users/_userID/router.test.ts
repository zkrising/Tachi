import { PasswordCompare } from "../../auth/auth";
import db from "external/mongo/db";
import { ONE_DAY, ONE_YEAR } from "lib/constants/time";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Random20Hex } from "utils/misc";
import type { Game, ImportDocument, ImportTypes, UserGameStats } from "tachi-common";

t.test("GET /api/v1/users/:userID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should retrieve a user on their ID.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1");

		t.hasStrict(res.body, {
			success: true,
			description: "Found user test_zkldi.",
			body: {
				id: 1,
				username: "test_zkldi",
			},
		});

		t.end();
	});

	t.test("Should retrieve a user on their name.", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi");

		t.hasStrict(res.body, {
			success: true,
			description: "Found user test_zkldi.",
			body: {
				id: 1,
				username: "test_zkldi",
			},
		});

		t.end();
	});

	t.test("Should retrieve a user on their name case insensitively.", async (t) => {
		const res = await mockApi.get("/api/v1/users/TeSt_ZklDI");

		t.hasStrict(res.body, {
			success: true,
			description: "Found user test_zkldi.",
			body: {
				id: 1,
				username: "test_zkldi",
			},
		});

		t.end();
	});

	t.test("Should return 404 on users that don't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/users/someguy");

		t.hasStrict(res.body, {
			success: false,
			description: "The user someguy does not exist.",
		});

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should require authentication", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1");

		t.equal(res.statusCode, 401);

		// needs self key auth
		await db["api-tokens"].insert({
			token: "noperm",
			permissions: {},
			identifier: "No permissions token",
			userID: 1,
			fromAPIClient: null,
		});

		const res2 = await mockApi.patch("/api/v1/users/1").set("Authorization", "Bearer noperm");

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.test("Should reject empty updates.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should update the user doc.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			status: "Hello World!",
		});

		t.equal(res.body.body.status, "Hello World!");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.status, "Hello World!");

		t.end();
	});

	t.test("Should allow empty strings for about me.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			about: "",
		});

		t.equal(res.statusCode, 200);

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.about, "");

		t.end();
	});

	t.test("Shouldn't allow about me to be set to null.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			about: null,
		});

		t.equal(res.statusCode, 400);

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.about, "test_user_not_real");

		t.end();
	});

	t.test("Shouldn't alter other properties.", async (t) => {
		await db.users.update({ id: 1 }, { $set: { "socialMedia.discord": "foo#123" } });

		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			status: "Hello World!",
		});

		t.equal(res.body.body.status, "Hello World!");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.status, "Hello World!");
		t.equal(dbUser?.about, "test_user_not_real");
		t.equal(dbUser?.socialMedia.discord, "foo#123");

		t.end();
	});

	t.test("Should correctly strip twitter urls.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			twitter: "https://twitter.com/zkldi",
		});

		t.equal(res.body.body.socialMedia.twitter, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.twitter, "zkldi");

		t.end();
	});

	t.test("Should correctly strip youtube urls.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			youtube: "https://youtube.com/user/zkldi",
		});

		t.equal(res.body.body.socialMedia.youtube, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.youtube, "zkldi");

		const res2 = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			youtube: "https://youtube.com/channel/zkldi",
		});

		t.equal(res2.body.body.socialMedia.youtube, "zkldi");

		const dbUser2 = await db.users.findOne({ id: 1 });

		t.equal(dbUser2?.socialMedia.youtube, "zkldi");

		t.end();
	});

	t.test("Should correctly strip github urls.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			github: "https://github.com/zkldi",
		});

		t.equal(res.body.body.socialMedia.github, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.github, "zkldi");

		t.end();
	});

	t.test("Should correctly strip twitch urls.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			twitch: "https://twitch.tv/zkldi",
		});

		t.equal(res.body.body.socialMedia.twitch, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.twitch, "zkldi");

		t.end();
	});

	t.test("Should correctly strip steam urls.", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1").set("Cookie", cookie).send({
			steam: "https://steamcommunity.com/id/zkldi",
		});

		t.equal(res.body.body.socialMedia.steam, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.steam, "zkldi");

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/change-password", async (t) => {
	t.beforeEach(ResetDBState);
	const cookie = await CreateFakeAuthCookie(mockApi);

	function send(content: Record<string, unknown>) {
		return mockApi.post("/api/v1/users/1/change-password").set("Cookie", cookie).send(content);
	}

	t.test("Must require !password and !oldPassword to be a valid password.", async (t) => {
		const res = await send({
			"!password": null,
			"!oldPassword": "heres_my_old_password",
		});

		t.equal(res.statusCode, 400);
		t.match(
			res.body.description,
			/!password/gu,
			"Should be related to the invalid password field."
		);

		const res2 = await send({
			"!password": "heres_my_new_password",
			"!oldPassword": "short",
		});

		t.equal(res2.statusCode, 400);
		t.match(
			res2.body.description,
			/!oldPassword/gu,
			"Should be related to the invalid !oldPassword field."
		);

		t.end();
	});

	t.test("Must require !oldPassword to match.", async (t) => {
		const res = await send({
			"!password": "new_password",
			"!oldPassword": "NOT_MY_PASSWORD",
		});

		t.equal(res.statusCode, 401);
		t.match(res.body.description, /old password doesn't match/iu);

		t.end();
	});

	t.test("Should update password if everything checks out.", async (t) => {
		const res = await send({
			"!password": "NEW_PASSWORD",
			"!oldPassword": "password",
		});

		t.equal(res.statusCode, 200);

		const newPrivateInfo = await db["user-private-information"].findOne({
			userID: 1,
		});

		t.not(newPrivateInfo, null, "newPrivateInfo should not be null.");

		t.ok(
			PasswordCompare("NEW_PASSWORD", newPrivateInfo!.password),
			"Should update the users password to the hash of NEW_PASSWORD."
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/game-stats", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all of a user's game stats.", async (t) => {
		await db["game-stats"].remove({});

		const stats: Array<UserGameStats> = [
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				classes: {},
				ratings: {
					ktLampRating: 12,
				},
			},
			{
				userID: 1,
				game: "iidx",
				playtype: "DP",
				classes: {},
				ratings: {
					ktLampRating: 11,
				},
			},
			{
				userID: 1,
				game: "gitadora",
				playtype: "Dora",
				classes: {},
				ratings: {
					skill: 4843,
				},
			},
		];

		await db["game-stats"].insert(stats);

		for (const s of stats) {
			delete s._id;
		}

		const res = await mockApi.get("/api/v1/users/test_zkldi/game-stats");

		t.hasStrict(res.body, {
			success: true,
			description: "Returned 3 stats objects.",
		});

		const returns = res.body.body.map((e: UserGameStats) => `${e.game}-${e.playtype}`);

		// amusing small hacks
		t.equal(returns.length, 3);
		t.ok(returns.includes("iidx-SP"));
		t.ok(returns.includes("iidx-DP"));
		t.ok(returns.includes("gitadora-Dora"));

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/recent-imports", (t) => {
	t.beforeEach(ResetDBState);

	function mkImport(
		game: Game,
		importType: ImportTypes,
		timeFinished: number,
		userIntent: boolean
	): ImportDocument {
		return {
			classDeltas: [],
			createdSessions: [],
			errors: [],
			game,
			importType,
			importID: Random20Hex(),
			goalInfo: [],
			idStrings: [],
			milestoneInfo: [],
			playtypes: [],
			scoreIDs: [],
			timeFinished,
			timeStarted: 0,
			userID: 1,
			userIntent,
		};
	}

	t.test("Should work cross game and ignore imports without userIntent.", async (t) => {
		await db.imports.insert([
			mkImport("iidx", "api/arc-iidx", Date.now() - ONE_DAY, true),
			mkImport("iidx", "api/arc-iidx", Date.now() - ONE_DAY, true),
			mkImport("sdvx", "api/arc-sdvx", Date.now() - ONE_DAY, false),
			mkImport("iidx", "api/arc-iidx", Date.now() - ONE_DAY, false),
			mkImport("sdvx", "api/arc-sdvx", Date.now() - ONE_DAY, true),
		]);

		const res = await mockApi.get("/api/v1/users/1/recent-imports");

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, [
			{
				importType: "api/arc-iidx",
				count: 2,
			},
			{
				importType: "api/arc-sdvx",
				count: 1,
			},
		]);

		t.end();
	});

	t.test("Should ignore imports that were too long ago.", async (t) => {
		await db.imports.insert([
			mkImport("iidx", "api/arc-iidx", Date.now() - ONE_DAY, true),
			mkImport("iidx", "ir/fervidex", Date.now() - ONE_YEAR, true),
			mkImport("iidx", "ir/fervidex", Date.now() - ONE_YEAR, true),
			mkImport("iidx", "ir/fervidex", Date.now() - ONE_YEAR, true),
			mkImport("iidx", "ir/fervidex", Date.now() - ONE_YEAR, true),
			mkImport("sdvx", "api/arc-sdvx", Date.now() - ONE_DAY, true),
			mkImport("sdvx", "api/arc-sdvx", Date.now() - ONE_DAY, true),
		]);

		const res = await mockApi.get("/api/v1/users/1/recent-imports");

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, [
			{
				importType: "api/arc-sdvx",
				count: 2,
			},
			{
				importType: "api/arc-iidx",
				count: 1,
			},
		]);

		t.end();
	});

	t.end();
});
