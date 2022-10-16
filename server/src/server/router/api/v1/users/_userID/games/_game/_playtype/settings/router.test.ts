/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import type { UGPTSettings } from "tachi-common";

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
				preferredRanking: null,
				scoreBucket: null,
				defaultTable: null,
				stats: [],
				gameSpecific: {
					display2DXTra: false,
					bpiTarget: 0,
				},
			},
			rivals: [],
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
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				preferredScoreAlg: "ktLampRating",
			});

		t.strictSame(
			res.body.body,
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				preferences: {
					preferredScoreAlg: "ktLampRating",
					preferredSessionAlg: null,
					preferredProfileAlg: null,
					scoreBucket: null,
					preferredRanking: null,
					defaultTable: null,
					stats: [],
					gameSpecific: {
						display2DXTra: false,
						bpiTarget: 0,
					},
				},
				rivals: [],
			},
			"Should only update the mutated properties."
		);

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(data?.preferences.preferredScoreAlg, "ktLampRating");

		t.end();
	});

	t.test("Should update a user's game specific settings.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				preferredScoreAlg: "ktLampRating",
				gameSpecific: {
					display2DXTra: true,
					bpiTarget: 50,
				},
			});

		t.strictSame(
			res.body.body,
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				preferences: {
					preferredScoreAlg: "ktLampRating",
					preferredSessionAlg: null,
					preferredProfileAlg: null,
					preferredRanking: null,
					scoreBucket: null,
					defaultTable: null,
					stats: [],
					gameSpecific: {
						display2DXTra: true,
						bpiTarget: 50,
					},
				},
				rivals: [],
			},
			"Should only update the mutated properties."
		);

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(data?.preferences.preferredScoreAlg, "ktLampRating");

		t.end();
	});

	t.test("Should update an IIDX player's bpiTarget settings.", (t) => {
		t.beforeEach(async () => {
			await db["api-tokens"].insert({
				userID: 1,
				identifier: "api_token",
				permissions: {
					customise_profile: true,
				},
				token: "api_token",
				fromAPIClient: null,
			});
		});

		for (const target of [0, 10, 15, 100]) {
			t.test(`Should be able to update the BPI target to ${target}`, async (t) => {
				const res = await mockApi
					.patch("/api/v1/users/1/games/iidx/SP/settings")
					.set("Authorization", "Bearer api_token")
					.send({
						gameSpecific: {
							bpiTarget: target,
						},
					});

				t.equal(res.statusCode, 200);

				t.strictSame(
					res.body.body,
					{
						userID: 1,
						game: "iidx",
						playtype: "SP",
						preferences: {
							preferredScoreAlg: null,
							preferredSessionAlg: null,
							preferredProfileAlg: null,
							preferredRanking: null,
							scoreBucket: null,
							defaultTable: null,
							stats: [],
							gameSpecific: {
								display2DXTra: false,
								bpiTarget: target,
							},
						},
						rivals: [],
					},
					"Should only update the mutated properties."
				);

				const data = (await db["game-settings"].findOne({
					userID: 1,
					game: "iidx",
					playtype: "SP",
				})) as UGPTSettings<"iidx:DP" | "iidx:SP"> | null;

				t.equal(data?.preferences.gameSpecific.bpiTarget, target);

				t.end();
			});
		}

		t.test("Should reject float BPI targets.", async (t) => {
			const res = await mockApi
				.patch("/api/v1/users/1/games/iidx/SP/settings")
				.set("Authorization", "Bearer api_token")
				.send({
					gameSpecific: {
						bpiTarget: 10.5,
					},
				});

			t.equal(res.statusCode, 400);

			t.end();
		});

		t.test("Should reject negative BPI targets", async (t) => {
			const res = await mockApi
				.patch("/api/v1/users/1/games/iidx/SP/settings")
				.set("Authorization", "Bearer api_token")
				.send({
					gameSpecific: {
						bpiTarget: -10,
					},
				});

			t.equal(res.statusCode, 400);

			t.end();
		});

		t.test("Should reject >= 100 BPI targets", async (t) => {
			const res = await mockApi
				.patch("/api/v1/users/1/games/iidx/SP/settings")
				.set("Authorization", "Bearer api_token")
				.send({
					gameSpecific: {
						bpiTarget: 101,
					},
				});

			t.equal(res.statusCode, 400);

			t.end();
		});

		t.end();
	});

	t.test("Should reject a arbitrary things on game specific settings.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				preferredScoreAlg: "ktRating",
				gameSpecific: {
					display2DXTra: true,
					arbitraryValue: {},
				},
			});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should reject a arbitrary things on game specific settings.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				preferredScoreAlg: "ktRating",
				gameSpecific: {
					display2DXTra: true,
					arbitraryValue: {},
				},
			});

		t.equal(res.statusCode, 400);

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
			fromAPIClient: null,
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
			fromAPIClient: null,
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
			fromAPIClient: null,
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

	t.test("Should update a user's default table.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				defaultTable: "mock_table",
			});

		t.strictSame(
			res.body.body,
			{
				userID: 1,
				game: "iidx",
				playtype: "SP",
				preferences: {
					preferredScoreAlg: null,
					preferredSessionAlg: null,
					preferredProfileAlg: null,
					preferredRanking: null,
					scoreBucket: null,
					defaultTable: "mock_table",
					stats: [],
					gameSpecific: {
						display2DXTra: false,
						bpiTarget: 0,
					},
				},
				rivals: [],
			},
			"Should only update the mutated properties."
		);

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(data?.preferences.defaultTable, "mock_table");

		t.end();
	});

	t.test("Should not allow updating to a table that doesn't exist.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "api_token",
			permissions: {
				customise_profile: true,
			},
			token: "api_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.patch("/api/v1/users/1/games/iidx/SP/settings")
			.set("Authorization", "Bearer api_token")
			.send({
				defaultTable: "fake_table",
			});

		t.equal(res.statusCode, 400);

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "iidx",
			playtype: "SP",
		});

		t.equal(data?.preferences.defaultTable, null);

		t.end();
	});

	t.end();
});
