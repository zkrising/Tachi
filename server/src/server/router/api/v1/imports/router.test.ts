import db from "external/mongo/db";
import { UserAuthLevels } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import { mkFakeImport } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { FakeImport } from "test-utils/test-data";

t.test("GET /api/v1/imports/:importID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() => db.imports.insert(FakeImport));

	t.test("Should return the import at this ID.", async (t) => {
		const res = await mockApi.get(`/api/v1/imports/${FakeImport.importID}`);

		t.equal(res.statusCode, 200, "Should return 200.");

		t.hasStrict(
			res.body.body,
			{
				user: {
					id: 1,
				},
				scores: [
					{
						scoreID: FakeImport.scoreIDs[0],
					},
				],
				charts: [
					{
						chartID: res.body.body.scores[0].chartID,
					},
				],
				songs: [
					{
						id: res.body.body.scores[0].songID,
					},
				],
				import: {
					importID: FakeImport.importID,
				},
			},
			"Should return the import and some info about it."
		);

		t.end();
	});

	t.test("Should return 404 if the import doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/imports/bad-import");

		t.equal(res.statusCode, 404, "Should return 404.");

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/imports/:importID/revert", async (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() => db.imports.insert(FakeImport));

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should revert the import at this ID.", async (t) => {
		const res = await mockApi
			.post(`/api/v1/imports/${FakeImport.importID}/revert`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200, "Should return 200.");

		t.strictSame(res.body.body, {}, "The response body should be empty.");

		t.resolveMatch(
			db.scores.findOne({ scoreID: FakeImport.scoreIDs[0] }),

			// @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60020
			null,
			"The scores that were part of this import should be deleted."
		);

		t.end();
	});

	t.test("Should return 404 if the import doesn't exist.", async (t) => {
		const res = await mockApi.post(`/api/v1/imports/doesnt-exist/revert`).set("Cookie", cookie);

		t.equal(res.statusCode, 404, "Should return 404.");

		t.end();
	});

	t.test("Should return 401 if the user isn't authed.", async (t) => {
		const res = await mockApi.post(`/api/v1/imports/${FakeImport.importID}/revert`);

		t.equal(res.statusCode, 401, "Should return 401.");

		t.end();
	});

	t.test("Should return 403 if the user is authed as someone else.", async (t) => {
		await db.users.update(
			{
				id: 1,
			},
			{
				$set: { authLevel: UserAuthLevels.USER },
			}
		);

		const someoneElsesImport = mkFakeImport({ userID: 2, importID: "someone_elses" });

		await db.imports.insert(someoneElsesImport);

		const res = await mockApi
			.post(`/api/v1/imports/${someoneElsesImport.importID}/revert`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403, "Should return 403.");

		t.end();
	});

	t.test(
		"Should allow reverting another users import if the requester is an admin.",
		async (t) => {
			await db.users.update(
				{
					id: 1,
				},
				{
					$set: { authLevel: UserAuthLevels.ADMIN },
				}
			);

			const someoneElsesImport = mkFakeImport({ userID: 2, importID: "someone_elses" });

			await db.imports.insert(someoneElsesImport);

			const res = await mockApi
				.post(`/api/v1/imports/${someoneElsesImport.importID}/revert`)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 200, "Should return 200.");

			t.strictSame(res.body.body, {}, "The response body should be empty.");

			t.resolveMatch(
				db.scores.findOne({ scoreID: FakeImport.scoreIDs[0] }),

				// @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60020
				null,
				"The scores that were part of this import should be deleted."
			);

			t.end();
		}
	);

	t.end();
});

t.todo("GET /api/v1/imports");
t.todo("GET /api/v1/imports/failed");
