import t from "tap";
import db from "external/mongo/db";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { UserGameStats } from "tachi-common";

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

t.test("PATCH /api/v1/users/:userID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["api-tokens"].insert({
			identifier: "customiseProfile",
			permissions: {
				customise_profile: true,
			},
			token: "valid_token",
			userID: 1,
		});
	});

	t.test("Should require authentication", async (t) => {
		const res = await mockApi.patch("/api/v1/users/1");

		t.equal(res.statusCode, 401);

		await db["api-tokens"].insert({
			token: "noperm",
			permissions: {},
			identifier: "No permissions token",
			userID: 1,
		});

		const res2 = await mockApi.patch("/api/v1/users/1").set("Authorization", "Bearer noperm");

		t.equal(res2.statusCode, 403);

		t.end();
	});

	t.test("Should reject empty updates.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should update the user doc.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				status: "Hello World!",
			});

		t.equal(res.body.body.status, "Hello World!");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.status, "Hello World!");

		t.end();
	});

	t.test("Shouldn't allow about me to be set to null.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				about: null,
			});

		t.equal(res.statusCode, 400);

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.about, "test_user_not_real");

		t.end();
	});

	t.test("Shouldn't alter other properties.", async (t) => {
		await db.users.update({ id: 1 }, { $set: { "socialMedia.discord": "foo#123" } });

		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
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
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				twitter: "https://twitter.com/zkldi",
			});

		t.equal(res.body.body.socialMedia.twitter, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.twitter, "zkldi");

		t.end();
	});

	t.test("Should correctly strip youtube urls.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				youtube: "https://youtube.com/user/zkldi",
			});

		t.equal(res.body.body.socialMedia.youtube, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.youtube, "zkldi");

		const res2 = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				youtube: "https://youtube.com/channel/zkldi",
			});

		t.equal(res2.body.body.socialMedia.youtube, "zkldi");

		const dbUser2 = await db.users.findOne({ id: 1 });

		t.equal(dbUser2?.socialMedia.youtube, "zkldi");

		t.end();
	});

	t.test("Should correctly strip github urls.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				github: "https://github.com/zkldi",
			});

		t.equal(res.body.body.socialMedia.github, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.github, "zkldi");

		t.end();
	});

	t.test("Should correctly strip twitch urls.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				twitch: "https://twitch.tv/zkldi",
			});

		t.equal(res.body.body.socialMedia.twitch, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.twitch, "zkldi");

		t.end();
	});

	t.test("Should correctly strip steam urls.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/users/1")
			.set("Authorization", "Bearer valid_token")
			.send({
				steam: "https://steamcommunity.com/id/zkldi",
			});

		t.equal(res.body.body.socialMedia.steam, "zkldi");

		const dbUser = await db.users.findOne({ id: 1 });

		t.equal(dbUser?.socialMedia.steam, "zkldi");

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/game-stats", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all of a user's game stats.", async (t) => {
		await db["game-stats"].remove({});

		const stats: UserGameStats[] = [
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				classes: {},
				ratings: {
					ktRating: 12,
				},
			},
			{
				userID: 1,
				game: "iidx",
				playtype: "DP",
				classes: {},
				ratings: {
					ktRating: 11,
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
