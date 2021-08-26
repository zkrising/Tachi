/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/settings", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a user's settings.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/settings");

		t.strictSame(res.body.body, {
			userID: 1,
			game: "iidx",
			playtype: "SP",
			preferences: {
				preferredScoreAlg: null,
				preferredSessionAlg: null,
				preferredProfileAlg: null,
				stats: [],
			},
		});

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/users/:userID/games/:game/:playtype/settings", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should update a user's settings.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				preferredScoreAlg: "ktRating",
			});

		t.strictSame(
			res.body.body,
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				preferences: {
					preferredScoreAlg: "ktRating",
					preferredSessionAlg: null,
					preferredProfileAlg: null,
					stats: [],
				},
			},
			"Should only update the mutated properties."
		);

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(data?.preferences.preferredScoreAlg, "ktRating");

		t.end();
	});

	t.test("Requires the user to be authed as the requested user.", async (t) => {
		await db["api-tokens"].insert({
			userID: 2,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", `Bearer api_token`);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Requires the permission customise_profile", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: false,
			},
			token: "api_token",
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", `Bearer api_token`);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should reject invalid values.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "foo",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
		});

		for (const key of [
			"preferredScoreAlg",
			"preferredSessionAlg",
			"preferredProfileAlg",
		] as const) {
			const res = await mockApi
				.patch("/api/v1/users/1/games/iidx/SP/settings")
				.set("Authorization", "Bearer api_token")
				.send({
					[key]: "nonsense",
				});

			t.equal(res.statusCode, 400);

			const data = await db["game-settings"].findOne({
				userID: 1,
				game: "iidx",
				playtype: "SP",
			});

			t.equal(data?.preferences[key], null, "Should be unmodified.");
		}

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
