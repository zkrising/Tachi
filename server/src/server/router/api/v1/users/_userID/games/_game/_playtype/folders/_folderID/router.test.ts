import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { ChartDocument, FolderDocument, ScoreDocument, SongDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
    GetKTDataJSON,
    Testing511SPA,
    TestingIIDXFolderSP10,
    TestingIIDXSPScore,
    TestingIIDXSPScorePB
} from "test-utils/test-data";
import { CreateFolderChartLookup } from "utils/folder";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		const folder = deepmerge(TestingIIDXFolderSP10, {
			folderID: "testing_folder",
		}) as FolderDocument;
		await db.folders.insert(folder);
		await CreateFolderChartLookup(folder, true);
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
	const folder = deepmerge(TestingIIDXFolderSP10, {
		folderID: "testing_folder",
	}) as FolderDocument;

	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.folders.insert(folder);
		await CreateFolderChartLookup(folder, true);
		await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {}));
	});

	t.test("Should return the users scores on this folder in timeline order", async (t) => {
		// set up a more realistic scenario so we can fire more data at it.
		await db.songs.iidx.remove({});
		await db.charts.iidx.remove({});
		await db["folder-chart-lookup"].remove({});
		await db.songs.iidx.insert(GetKTDataJSON("./tachi/tachi-songs-iidx.json") as Array<SongDocument<"iidx">>);
		await db.charts.iidx.insert(GetKTDataJSON("./tachi/tachi-charts-iidx.json") as Array<ChartDocument<"iidx:DP"|"iidx:SP">>);

		await CreateFolderChartLookup(folder, true);

		await db.scores.insert([
			deepmerge(TestingIIDXSPScore, {
				scoreID: "OTHER_SCORE_ID",
				timeAchieved: 500,
				songID: 5,
				chartID: "f3e7f84103d68f9f27193f037f35d0bca8c6d607",
			}),
			deepmerge(TestingIIDXSPScore, {
				scoreID: "OTHER_SCORE_ID_2",
				timeAchieved: 100,
				songID: 5,
				chartID: "f3e7f84103d68f9f27193f037f35d0bca8c6d607",
			}),
			deepmerge(TestingIIDXSPScore, {
				scoreID: "OTHER_SCORE_ID_NULL",
				timeAchieved: null,
				songID: 5,
				chartID: "f3e7f84103d68f9f27193f037f35d0bca8c6d607",
			}),
			deepmerge(TestingIIDXSPScore, {
				scoreData: {
					lampIndex: 3,
					lamp: "CLEAR",
				},
				scoreID: "OTHER_SCORE_ID_3",
				timeAchieved: 50,
				songID: 5,
				chartID: "f3e7f84103d68f9f27193f037f35d0bca8c6d607",
			}),
			deepmerge(TestingIIDXSPScore, {
				scoreID: "OTHER_SCORE_ID_4",
				timeAchieved: 200,
				songID: 6,
				chartID: "3b5fa295d243c131752e2f1ad835998f6dad2e97",
			}),
		]);

		const res = await mockApi.get(
			"/api/v1/users/1/games/iidx/SP/folders/testing_folder/timeline?criteriaType=lamp&criteriaValue=4"
		);

		t.equal(res.body.body.scores.length, 3);

		t.equal(
			res.body.body.scores[0].scoreID,
			"TESTING_SCORE_ID",
			"First score should be TESTING_SCORE_ID, as it has a timeAchieved of null."
		);
		t.equal(
			res.body.body.scores[1].scoreID,
			"OTHER_SCORE_ID_2",
			"Second score returned should be OTHER_SCORE_ID_2"
		);
		t.equal(
			res.body.body.scores[2].scoreID,
			"OTHER_SCORE_ID_4",
			"Third score should be OTHER_SCORE_ID_4, as it was achieved later."
		);
		t.notOk(
			res.body.body.scores.some((k: ScoreDocument) => k.scoreID === "OTHER_SCORE_ID_NULL"),
			"OTHER_SCORE_ID_NULL should never appear, as it is a null timestamp for a score that has a real timestamp."
		);

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
