import db from "external/mongo/db";
import t from "tap";
import { InsertFakeTokenWithAllPerms } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingBarbatosScore } from "test-utils/test-data";

t.test("POST /ir/barbatos/score/submit", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

	t.test("Should import a valid score", async (t) => {
		const res = await mockApi
			.post("/ir/barbatos/score/submit")
			.set("Authorization", "Bearer mock_token")
			.send(TestingBarbatosScore);

		t.equal(res.body.success, true, "Should be successful");

		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		const scores = await db.scores.count({
			service: "Barbatos",
		});

		t.equal(scores, 1, "Should import 1 score.");

		t.end();
	});

	t.test("Should reject an invalid body", async (t) => {
		const res = await mockApi
			.post("/ir/barbatos/score/submit")
			.set("Authorization", "Bearer mock_token")
			.send({});

		t.equal(res.body.success, false, "Should not be successful.");
		t.equal(res.status, 400, "Should return 400.");

		t.end();
	});

	t.test("Should require authorisation.", async (t) => {
		const res = await mockApi.post("/ir/barbatos/score/submit").send(TestingBarbatosScore);

		t.equal(res.statusCode, 401, "Should return 401 for no authorization header.");

		t.end();
	});

	t.test("Should require valid authorisation.", async (t) => {
		const res = await mockApi
			.post("/ir/barbatos/score/submit")
			.set("Authorization", "Bearer invalid_token")
			.send(TestingBarbatosScore);

		t.equal(res.statusCode, 401, "Should return 401 for invalid authorization header.");

		t.end();
	});

	t.end();
});
