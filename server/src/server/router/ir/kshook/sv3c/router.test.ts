import deepmerge from "deepmerge";
import t from "tap";
import { InsertFakeTokenWithAllPerms } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { TestingKsHookSV3CScore } from "test-utils/test-data";

t.test("POST /ir/kshook/sv3c/score/save", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

	// eslint-disable-next-line @typescript-eslint/ban-types
	const validSubmit = (data: object) =>
		mockApi
			.post("/ir/kshook/sv3c/score/save")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "kshook/0.1.0")
			.set("X-Software-Model", "QCV:J:C:A:2021100600")
			.send(data);

	t.test("Should import a valid score to the database.", async (t) => {
		const res = await validSubmit(TestingKsHookSV3CScore);

		t.equal(res.status, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.body.scoreIDs.length, 1, "Should import one score.");
		t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

		t.end();
	});

	t.test("Should reject invalid scores to the database.", async (t) => {
		const res = await validSubmit({});

		t.equal(res.status, 400, "Should return 400 for an empty object.");
		t.type(res.body.error, "string", "Should attach an error message.");

		const res2 = await validSubmit(
			deepmerge(TestingKsHookSV3CScore, {
				clear: "INVALID_CLEAR_TYPE",
			})
		);

		t.equal(res2.status, 400, "Should return 400 for an invalid clear type.");
		t.type(res2.body.error, "string", "Should attach an error message.");

		t.end();
	});

	t.test("Should reject scores with invalid software models.", async (t) => {
		const res = await mockApi
			.post("/ir/kshook/sv3c/score/save")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "kshook/0.1.0")
			.set("X-Software-Model", "LDJ:J:C:A:2021100600")
			.send(TestingKsHookSV3CScore);

		t.equal(res.status, 400, "Should reject an import with invalid software model.");
		t.type(res.body.error, "string", "Should have an error message.");

		const res2 = await mockApi
			.post("/ir/kshook/sv3c/score/save")
			.set("Authorization", "Bearer mock_token")
			.set("User-Agent", "kshook/0.1.0")
			.send(TestingKsHookSV3CScore);

		t.equal(res2.status, 400, "Should reject an import with no software model.");
		t.type(res2.body.error, "string", "Should have an error message.");

		t.end();
	});

	t.test("Should reject scores with invalid auth.", async (t) => {
		const res = await mockApi
			.post("/ir/kshook/sv3c/score/save")
			.set("Authorization", "Bearer foo")
			.set("User-Agent", "kshook/0.1.0")
			.set("X-Software-Model", "QCV:J:C:A:2021100600")
			.send(TestingKsHookSV3CScore);

		t.equal(res.status, 401, "Should reject an import with invalid authentication.");
		t.type(res.body.error, "string", "Should have an error message.");

		const res2 = await mockApi
			.post("/ir/kshook/sv3c/score/save")
			.set("User-Agent", "kshook/0.1.0")
			.set("X-Software-Model", "QCV:J:C:A:2021100600")
			.send(TestingKsHookSV3CScore);

		t.equal(res2.status, 401, "Should reject an import with no authentication.");
		t.type(res2.body.error, "string", "Should have an error message.");

		t.end();
	});

	t.end();
});
