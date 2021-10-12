import t from "tap";
import db from "external/mongo/db";

import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Testing511SPA } from "test-utils/test-data";

t.test("GET /api/v1/scores/:scoreID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the score at that ID.", async (t) => {
		const res = await mockApi.get("/api/v1/scores/TESTING_SCORE_ID");

		t.equal(res.body.body.score.scoreID, "TESTING_SCORE_ID");

		t.end();
	});

	t.test("Should return the associated data if the param is set.", async (t) => {
		const res = await mockApi.get("/api/v1/scores/TESTING_SCORE_ID?getRelated=true");

		t.equal(res.body.body.score.scoreID, "TESTING_SCORE_ID");
		t.equal(res.body.body.user.id, 1);
		t.equal(res.body.body.chart.chartID, Testing511SPA.chartID);
		t.equal(res.body.body.song.id, 1);

		t.end();
	});

	t.test("Should return 404 if the score does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/scores/not_real");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/scores/:scoreID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should modify the session if the user has permission to.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({
				comment: "hello_world",
			});

		t.equal(res.body.body.comment, "hello_world");

		const score = await db.scores.findOne({ scoreID: "TESTING_SCORE_ID" });

		t.equal(score?.comment, "hello_world");

		t.end();
	});

	t.test("Should modify highlighted status.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({
				highlight: true,
			});

		t.equal(res.body.body.highlight, true);

		const score = await db.scores.findOne({ scoreID: "TESTING_SCORE_ID" });

		t.equal(score?.highlight, true);

		t.end();
	});

	t.test("Should set comment status to null.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({
				comment: null,
			});

		t.equal(res.body.body.comment, null);

		const score = await db.scores.findOne({ scoreID: "TESTING_SCORE_ID" });

		t.equal(score?.comment, null);

		t.end();
	});

	t.test("Should restrict comments to those between 1 and 120 characters.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({
				comment: "",
			});

		t.equal(res.statusCode, 400);
		t.match(res.body.description, /\[K:comment\]/u);

		const res2 = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({
				comment: "a".repeat(121),
			});

		t.equal(res2.statusCode, 400);
		t.match(res2.body.description, /\[K:comment\]/u);

		t.end();
	});

	t.test("Should reject empty bodies.", async (t) => {
		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer fake_api_token")
			.send({});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should require authorisation as this user.", async (t) => {
		await db["api-tokens"].insert({
			token: "some_dude",
			userID: 2,
			identifier: "Fake Token",
			permissions: {
				customise_score: true,
			},
		});

		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer some_dude")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /You are not authorised/u);

		t.end();
	});

	t.test("Should require the customise_score permission", async (t) => {
		await db["api-tokens"].insert({
			token: "some_token",
			userID: 1,
			identifier: "another fake token",
			permissions: {},
		});

		const res = await mockApi
			.patch("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer some_token")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /customise_score/u);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/scores/:scoreID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should delete a score if the requester can.", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "foo",
			permissions: {
				delete_score: true,
			},
			token: "foo",
		});

		const res = await mockApi
			.delete("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer foo");

		t.equal(res.statusCode, 200);

		const dbScore = await db.scores.findOne({ scoreID: "TESTING_SCORE_ID" });

		t.equal(dbScore, null, "Should remove the score from the database.");

		t.end();
	});

	t.test("Should require authorisation as this user.", async (t) => {
		await db["api-tokens"].insert({
			token: "some_dude",
			userID: 2,
			identifier: "Fake Token",
			permissions: {
				delete_score: true,
			},
		});

		const res = await mockApi
			.delete("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer some_dude")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /You are not authorised/u);

		t.end();
	});

	t.test("Should require the delete_score permission", async (t) => {
		await db["api-tokens"].insert({
			token: "some_token",
			userID: 1,
			identifier: "another fake token",
			permissions: {},
		});

		const res = await mockApi
			.delete("/api/v1/scores/TESTING_SCORE_ID")
			.set("Authorization", "Bearer some_token")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /delete_score/u);

		t.end();
	});

	t.end();
});
