import t from "tap";
import db from "external/mongo/db";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData, Testing511SPA } from "test-utils/test-data";
import { PBScoreDocument } from "tachi-common";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/games/:game/:playtype/charts", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return the most popular charts if no param is set.", async (t) => {
		await db["personal-bests"].insert([
			{
				chartID: Testing511SPA.chartID,
				userID: 1,
			},
			{
				chartID: Testing511SPA.chartID,
				userID: 2,
			},
			{
				chartID: Testing511SPA.chartID,
				userID: 3,
			},
			{
				chartID: "fc7edc6bcfa701a261c89c999ddbba3e2195597b", //gambol hyper
				userID: 1,
			},
		] as PBScoreDocument[]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/charts");

		t.hasStrict(res.body.body.charts[0], {
			__playcount: 3,
			chartID: Testing511SPA.chartID,
		});

		t.hasStrict(res.body.body.charts[1], {
			__playcount: 1,
			chartID: "fc7edc6bcfa701a261c89c999ddbba3e2195597b",
		});

		t.equal(res.body.body.charts.length, 2);

		t.end();
	});

	t.test("Should search charts if a search param is set.", async (t) => {
		await db["personal-bests"].insert([
			{
				chartID: "fc7edc6bcfa701a261c89c999ddbba3e2195597b", //gambol hyper
				userID: 1,
			},
		] as PBScoreDocument[]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/charts?search=gambol");

		t.hasStrict(res.body.body.charts[0], {
			__playcount: 1,
			chartID: "fc7edc6bcfa701a261c89c999ddbba3e2195597b",
		});

		// gambol has SPB, SPN and SPH
		t.equal(res.body.body.charts.length, 1);

		t.end();
	});

	t.end();
});
