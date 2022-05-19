import db from "external/mongo/db";
import { ChartDocument, PBScoreDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	GetKTDataJSON,
	LoadTachiIIDXData,
	Testing511Song,
	Testing511SPA,
	TestingIIDXSPScorePB,
} from "test-utils/test-data";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/pbs/best", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return a user's best 100 personal bests.", async (t) => {
		const mockPBs: PBScoreDocument[] = [];

		for (let i = 0; i < 200; i++) {
			mockPBs.push({
				userID: 1,
				game: "iidx",
				playtype: "SP",
				isPrimary: true,
				chartID: i.toString(), // hack to generate some random chartIDs
				songID: Testing511Song.id,
				calculatedData: {
					ktLampRating: i,
				},
			} as PBScoreDocument);
		}

		await db["personal-bests"].insert(mockPBs);

		for (const sc of mockPBs) {
			delete sc._id; // lol
		}

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs/best");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 personal bests.",
			body: {
				pbs: mockPBs.slice(100).reverse(),
				songs: [Testing511Song],
				charts: [],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/pbs", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/pbs?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/pbs?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's personal bests.", async (t) => {
		const mockPBs: PBScoreDocument[] = [];

		const charts = GetKTDataJSON("./tachi/tachi-charts-iidx.json") as Array<ChartDocument>;

		for (let i = 0; i < 200; i++) {
			let chart = charts[i];

			if (!chart) {
				return t.fail(`Not enough charts in tachi-charts-iidx.json to mock pb data? Failed at index ${i}.`);
			}

			mockPBs.push({
				userID: 1,
				game: "iidx",
				playtype: "SP",
				isPrimary: true,
				chartID: chart.chartID,
				songID: chart.songID,
				calculatedData: {
					ktLampRating: i,
				},
			} as PBScoreDocument);
		}

		await db["personal-bests"].insert(mockPBs);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/pbs?search=5.1.1.");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 4 personal bests.",
			body: {
				pbs: [
					{
						chartID: "71865a2b6d3581decf076ae83c6621302c4bb271",
					},
					{
						chartID: "952805894d7d78257e87019426fa1d87aec834a5",
					},
					{
						chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					{
						chartID: "c641238220d73faf82659513ba03bde71b0b45f0",
					},
				],
				songs: [
					{
						title: "5.1.1.",
					},
				],
				charts: [
					{
						chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					{
						chartID: "71865a2b6d3581decf076ae83c6621302c4bb271",
					},
					{
						chartID: "c641238220d73faf82659513ba03bde71b0b45f0",
					},
					{
						chartID: "952805894d7d78257e87019426fa1d87aec834a5",
					},
				],
			},
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/pbs/:chartID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should retrieve the PB at this chart ID.", async (t) => {
		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await mockApi.get(`/api/v1/users/1/games/iidx/SP/pbs/${Testing511SPA.chartID}`);

		t.equal(res.body.body.pb.chartID, Testing511SPA.chartID);
		t.equal(res.body.body.chart.chartID, Testing511SPA.chartID);

		t.end();
	});

	t.test("Should retrieve composed scores if param is set.", async (t) => {
		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/pbs/${Testing511SPA.chartID}?getComposition=true`
		);

		t.equal(res.body.body.pb.chartID, Testing511SPA.chartID);
		t.equal(res.body.body.chart.chartID, Testing511SPA.chartID);
		t.equal(res.body.body.scores.length, 1);
		t.equal(res.body.body.scores[0].scoreID, "TESTING_SCORE_ID");

		t.end();
	});

	t.end();
});
