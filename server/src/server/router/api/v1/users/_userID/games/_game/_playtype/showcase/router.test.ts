import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { IIDX_GRADES, IIDX_LAMPS } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Testing511SPA, TestingIIDXFolderSP10, TestingIIDXSPScorePB } from "test-utils/test-data";
import { CreateFolderChartLookup } from "utils/folder";
import type { ChartDocument, PublicUserDocument } from "tachi-common";

const SetFolders = async () => {
	await db.folders.insert(TestingIIDXFolderSP10);
	await CreateFolderChartLookup(TestingIIDXFolderSP10, true);

	await db["game-settings"].remove({});

	await db["game-settings"].insert({
		userID: 1,
		game: "iidx",
		playtype: "SP",
		preferences: {
			preferredProfileAlg: null,
			preferredScoreAlg: null,
			preferredSessionAlg: null,
			scoreBucket: null,
			defaultTable: null,
			stats: [
				{
					folderID: TestingIIDXFolderSP10.folderID,
					mode: "folder",
					property: "lamp",
					gte: IIDX_LAMPS.HARD_CLEAR,
				},
				{
					chartID: Testing511SPA.chartID,
					mode: "chart",
					property: "score",
				},
			],
			gameSpecific: {
				display2DXTra: false,
				bpiTarget: 0,
			},
		},
		rivals: [],
	});

	await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {}));
};

t.test("GET /api/v1/users/:userID/games/:game/:playtype/showcase", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetFolders);

	t.test("Should return the evaluated stats for this user.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/showcase");

		t.hasStrict(res.body.body, [
			{
				stat: {
					mode: "folder",
				},
				result: {
					value: 1,
					outOf: 1,
				},
			},
			{
				stat: {
					mode: "chart",
				},
				result: {
					value: 1479,
				},
			},
		]);

		t.end();
	});

	t.test("Should project another users stats over this one if projectUser is set.", async (t) => {
		await db["game-settings"].insert({
			userID: 2,
			game: "iidx",
			playtype: "SP",
			preferences: {
				preferredProfileAlg: null,
				preferredScoreAlg: null,
				preferredSessionAlg: null,
				scoreBucket: null,
				defaultTable: null,
				stats: [
					{
						mode: "folder",
						folderID: TestingIIDXFolderSP10.folderID,
						property: "score",
						gte: 1480,
					},
				],
				gameSpecific: {
					display2DXTra: false,
					bpiTarget: 0,
				},
			},
			rivals: [],
		});

		// hack
		await db.users.insert({
			username: "test_acc",
			usernameLowercase: "test_acc",
			id: 2,
		} as PublicUserDocument);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/showcase?projectUser=2");

		t.hasStrict(res.body.body, [
			{
				stat: {
					mode: "folder",
				},
				result: {
					value: 0,
					outOf: 1,
				},
			},
		]);

		t.end();
	});

	t.test("Should return 404 if the user has not played this game.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/bms/7K/showcase");

		t.equal(res.statusCode, 404);

		t.match(res.body.description, /not played/iu);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/showcase/custom", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetFolders);

	t.test("Should return a custom folder evaluated stat on a user.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=folder&property=grade&gte=3&folderID=${TestingIIDXFolderSP10.folderID}`
		);

		t.hasStrict(res.body.body, {
			result: {
				value: 1,
				outOf: 1,
			},
		});

		t.end();
	});

	t.test("Should return a custom chart evaluated stat on a user.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=chart&property=grade&chartID=${Testing511SPA.chartID}`
		);

		t.hasStrict(res.body.body, {
			result: { value: IIDX_GRADES.AAA },
		});

		t.end();
	});

	t.test("Should reject for invalid folderID.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=folder&property=grade&gte=4`
		);

		t.equal(res.statusCode, 400, "Should reject for no folderID");

		const res2 = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=folder&property=grade&gte=4&folderID=foo&folderID=bar`
		);

		t.equal(res2.statusCode, 400, "Should reject for non-string folderID");

		t.end();
	});

	t.test("Should reject for invalid chartID.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=chart&property=grade&gte=4`
		);

		t.equal(res.statusCode, 400, "Should reject for no chartID");

		const res2 = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=chart&property=grade&chartID=foo&chartID=bar`
		);

		t.equal(res2.statusCode, 400, "Should reject for non-string chartID");

		t.end();
	});

	t.test("Should reject for chartID that doesn't exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=chart&property=grade&chartID=chart_does_not_exist`
		);

		t.equal(res.statusCode, 400);

		await db.charts.iidx.insert({
			chartID: "testing_dp_chart",
			playtype: "DP",
		} as ChartDocument);

		const res2 = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=chart&property=grade&chartID=testing_dp_chart`
		);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.test("Should reject for folderID that doesn't exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=folder&property=grade&gte=4&folderID=invalid`
		);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=folder&property=grade&gte=4&folderID=${TestingIIDXFolderSP10.folderID},invalid`
		);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.test("Should reject for invalid mode", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/showcase/custom?mode=nonsense&property=grade&gte=4&chartID=foo`
		);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/games/:game/:playtype/showcase", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(SetFolders);

	t.beforeEach(
		async () =>
			// eslint-disable-next-line no-return-await
			await db["api-tokens"].insert({
				userID: 1,
				identifier: "alt_token",
				permissions: {
					customise_profile: true,
				},
				token: "alt_token",
				fromAPIClient: null,
			})
	);

	t.test("Requires the user to be authed as the requested user.", async (t) => {
		await db["api-tokens"].insert({
			userID: 2,
			identifier: "alt_token",
			permissions: {
				customise_profile: true,
			},
			token: "altz_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer altz_token`);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Requires the permission customise_profile", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "alt_token",
			permissions: {
				customise_profile: false,
			},
			token: "unauth_token",
			fromAPIClient: null,
		});

		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer unauth_token`);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should replace a user's preferences.stats with the contained stats.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer alt_token`)
			.send([
				{
					mode: "chart",
					chartID: Testing511SPA.chartID,
					property: "lamp",
				},
			]);

		t.equal(res.statusCode, 200);

		const data = await db["game-settings"].findOne({ userID: 1, game: "iidx", playtype: "SP" });

		t.hasStrict(
			data?.preferences.stats,
			[
				{
					mode: "chart",
					chartID: Testing511SPA.chartID,
					property: "lamp",
				},
			],
			"Should update preferences.stats in the database."
		);

		t.hasStrict(
			res.body.body.preferences.stats,
			[
				{
					mode: "chart",
					chartID: Testing511SPA.chartID,
					property: "lamp",
				},
			],
			"Should return the updated preferences"
		);

		t.end();
	});

	t.test("Should reject for chartID that doesn't exist.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer alt_token`)
			.send([
				{
					mode: "chart",
					chartID: "chart_id_does_not_exist",
					property: "lamp",
				},
			]);

		t.equal(res.statusCode, 400);

		await db.charts.iidx.insert({
			chartID: "testing_dp_chart",
			playtype: "DP",
		} as ChartDocument);

		const res2 = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer alt_token`)
			.send([
				{
					mode: "chart",
					chartID: "testing_dp_chart",
					property: "lamp",
				},
			]);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.test("Should reject for folderID that doesn't exist.", async (t) => {
		const res = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer alt_token`)
			.send([
				{
					mode: "folder",
					property: "grade",
					gte: 4,
					folderID: "folder_does_not_exist",
				},
			]);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi
			.put("/api/v1/users/1/games/iidx/SP/showcase")
			.set("Authorization", `Bearer alt_token`)
			.send([
				{
					mode: "folder",
					property: "grade",
					gte: 4,
					folderID: [TestingIIDXFolderSP10.folderID, "folder_does_not_exist"],
				},
			]);

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.end();
});
