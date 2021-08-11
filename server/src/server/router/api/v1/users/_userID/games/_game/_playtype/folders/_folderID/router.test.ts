import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";
import deepmerge from "deepmerge";
import { Testing511SPA, TestingIIDXFolderSP10, TestingIIDXSPScorePB } from "test-utils/test-data";
import { FolderDocument } from "tachi-common";
import mockApi from "test-utils/mock-api";
import { CreateFolderChartLookup } from "utils/folder";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		const folder = deepmerge(TestingIIDXFolderSP10, {
			folderID: "testing_folder",
		}) as FolderDocument;
		await db.folders.insert(folder);
		await CreateFolderChartLookup(folder);
		await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {}));
	});

	t.test("Should return a user's PBs on a given folder.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/folders/testing_folder");

		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.charts[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.pbs.length, 1);
		t.equal(res.body.body.pbs[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.folder.folderID, "testing_folder");

		t.end();
	});

	t.test("Should return 404 if this folder does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/folders/fake_folder");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID/timeline", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		const folder = deepmerge(TestingIIDXFolderSP10, {
			folderID: "testing_folder",
		}) as FolderDocument;
		await db.folders.insert(folder);
		await CreateFolderChartLookup(folder);
		await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {}));
	});

	t.test("Should return the users scores on this folder in timeline order", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=lamp&criteriaValue=4"
		);

		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.scores.length, 1);
		t.equal(res.body.body.scores[0].scoreID, "TESTING_SCORE_ID");

		t.end();
	});

	t.test("Should reject invalid criteriaTypes", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=invalid"
		);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should reject invalid indexes for lamps", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=lamp&criteriaValue=-1"
		);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=lamp&criteriaValue=0.5"
		);

		t.equal(res2.statusCode, 400);

		const res3 = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=lamp&criteriaValue=100"
		);

		t.equal(res3.statusCode, 400);

		t.end();
	});

	t.test("Should reject invalid indexes for grades", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=grade&criteriaValue=-1"
		);

		t.equal(res.statusCode, 400);

		const res2 = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=grade&criteriaValue=0.5"
		);

		t.equal(res2.statusCode, 400);

		const res3 = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=grade&criteriaValue=100"
		);

		t.equal(res3.statusCode, 400);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
