import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Testing511SPA } from "test-utils/test-data";

const TESTING_SESSION_ID = "Qe7b00261b1d3ba8e5c9ee4e76e77ea9f07d9493b";

t.test("GET /api/v1/sessions/:sessionID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the session at this ID", async (t) => {
		const res = await mockApi.get(`/api/v1/sessions/${TESTING_SESSION_ID}`);

		t.equal(res.body.body.session.sessionID, TESTING_SESSION_ID);

		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.charts[0].chartID, Testing511SPA.chartID);

		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.songs[0].id, 1);

		t.equal(res.body.body.scores.length, 1);
		t.equal(res.body.body.scores[0].scoreID, "TESTING_SCORE_ID");

		t.equal(res.body.body.user.id, 1);

		t.end();
	});

	t.test("Should return 404 if the session does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/sessions/fake_session");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("PATCH /api/v1/sessions/:sessionID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should modify the session if the user has permission to.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				name: "hello_world",
			});

		t.equal(res.body.body.name, "hello_world");

		const session = await db.sessions.findOne({ sessionID: TESTING_SESSION_ID });

		t.equal(session?.name, "hello_world", "Should update the session in the database.");

		t.end();
	});

	t.test("Should modify highlighted status.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				highlight: true,
			});

		t.equal(res.body.body.highlight, true);

		const session = await db.sessions.findOne({ sessionID: TESTING_SESSION_ID });

		t.equal(session?.highlight, true);

		t.end();
	});

	t.test("Should set description.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				desc: "foobar",
			});

		t.equal(res.body.body.desc, "foobar");

		const session = await db.sessions.findOne({ sessionID: TESTING_SESSION_ID });

		t.equal(session?.desc, "foobar");

		t.end();
	});

	t.test("Should restrict names to those between 3 and 80 chars.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				name: "a",
			});

		t.equal(res.statusCode, 400);
		t.match(res.body.description, /\[K:name\]/u);

		const res2 = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				name: "a".repeat(81),
			});

		t.equal(res2.statusCode, 400);
		t.match(res2.body.description, /\[K:name\]/u);

		t.end();
	});

	t.test("Should restrict descs to those between 3 and 120 chars.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				desc: "a",
			});

		t.equal(res.statusCode, 400);
		t.match(res.body.description, /\[K:desc\]/u);

		const res2 = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer fake_api_token")
			.send({
				desc: "a".repeat(121),
			});

		t.equal(res2.statusCode, 400);
		t.match(res2.body.description, /\[K:desc\]/u);

		t.end();
	});

	t.test("Should reject empty bodies.", async (t) => {
		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
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
				customise_session: true,
			},
		});

		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer some_dude")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /You are not authorised/u);

		t.end();
	});

	t.test("Should require the customise_session permission", async (t) => {
		await db["api-tokens"].insert({
			token: "some_token",
			userID: 1,
			identifier: "another fake token",
			permissions: {},
		});

		const res = await mockApi
			.patch(`/api/v1/sessions/${TESTING_SESSION_ID}`)
			.set("Authorization", "Bearer some_token")
			.send({
				comment: "foo",
			});

		t.equal(res.statusCode, 403);

		t.match(res.body.description, /customise_session/u);

		t.end();
	});

	t.end();
});
