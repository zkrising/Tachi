import t from "tap";
import db from "external/mongo/db";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { Testing511SPA, TestingIIDXSPScorePB } from "test-utils/test-data";
import deepmerge from "deepmerge";
import { PBScoreDocument, PrivateUserDocument } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype/charts/:chartID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the chart at this ID", async (t) => {
		const res = await mockApi.get(`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}`);

		t.hasStrict(res.body.body, {
			song: {
				id: 1,
			},
			chart: {
				chartID: Testing511SPA.chartID,
			},
		});
		t.end();
	});

	t.test("Should return 404 if the chart doesnt exist", async (t) => {
		const res = await mockApi.get(`/api/v1/games/iidx/SP/charts/FAKECHART`);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/charts/:chartID/pbs", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the best PBs on that chart.", async (t) => {
		await db["personal-bests"].insert([
			TestingIIDXSPScorePB,
			deepmerge(TestingIIDXSPScorePB, {
				userID: 2,
				rankingData: { rank: 2 },
				scoreData: { score: 123 },
			}),
			deepmerge(TestingIIDXSPScorePB, {
				chartID: "other_chart",
			}) as PBScoreDocument,
		]);

		await db.users.insert({
			id: 2,
			username: "foo",
		} as PrivateUserDocument);

		const res = await mockApi.get(`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/pbs`);

		t.equal(res.body.body.pbs.length, 2);
		t.equal(res.body.body.users.length, 2);

		t.strictSame(
			res.body.body.pbs.map((e: PBScoreDocument) => e.chartID),
			[Testing511SPA.chartID, Testing511SPA.chartID]
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/charts/:chartID/playcount", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the total playcount on this chart.", async (t) => {
		const pbs: PBScoreDocument[] = [];

		delete TestingIIDXSPScorePB._id;

		for (let i = 1; i <= 132; i++) {
			pbs.push(deepmerge(TestingIIDXSPScorePB, { userID: i }) as PBScoreDocument);
		}

		await db["personal-bests"].insert(pbs);

		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/playcount`
		);

		t.equal(res.body.body.count, 132);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/charts/:chartID/tierlist", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all tierlist information about the chart.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/tierlist`
		);

		t.equal(res.body.body.tierlistData.length, 2);
		t.hasStrict(res.body.body.tierlist, { isDefault: true, game: "iidx", playtype: "SP" });
		t.equal(res.body.body.tierlistData[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.tierlistData[1].chartID, Testing511SPA.chartID);

		t.end();
	});

	t.test("Should throw 501 if no default tierlist exists", async (t) => {
		await db.tierlists.remove({});

		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/tierlist`
		);

		t.equal(res.statusCode, 501);

		t.end();
	});

	t.test("Should throw 404 if the tierlistID given does not exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/tierlist?tierlistID=foobar`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should support setting your own tierlistID", async (t) => {
		const tierlist = await db.tierlists.findOne({
			game: "iidx",
			playtype: "SP",
			isDefault: true,
		});

		if (!tierlist) {
			t.fail("No tierlists in database?");
			return;
		}

		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/charts/${Testing511SPA.chartID}/tierlist?tierlistID=${tierlist.tierlistID}`
		);

		t.equal(res.body.body.tierlistData.length, 2);
		t.equal(res.body.body.tierlist.tierlistID, tierlist.tierlistID);
		t.equal(res.body.body.tierlistData[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.tierlistData[1].chartID, Testing511SPA.chartID);

		t.end();
	});

	t.end();
});
