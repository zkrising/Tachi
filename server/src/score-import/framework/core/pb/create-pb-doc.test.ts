import t from "tap";
import db, { CloseMongoConnection } from "../../../../db/db";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { Testing511SPA, TestingIIDXSPScorePB } from "../../../../test-utils/test-data";
import { GetRankingInfo } from "./create-pb-doc";
import deepmerge from "deepmerge";

t.test("#GetRankingInfo", (t) => {
    t.beforeEach(ResetDBState);

    let chartID = Testing511SPA.chartID;

    t.test("Ranking info for one score", async (t) => {
        await db["score-pbs"].insert([
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 50 }, userID: 1 }),
        ]);

        let { outOf, ranking } = await GetRankingInfo(chartID, 1, 50);

        t.equal(outOf, 1, "Should correctly determine we're out of 1 score.");
        t.equal(ranking, 1, "Should correctly determine we're #1.");

        t.end();
    });

    t.test("Ranking info for multiple scores", async (t) => {
        await db["score-pbs"].insert([
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 50 }, userID: 1 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 60 }, userID: 2 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 70 }, userID: 3 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 80 }, userID: 4 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 40 }, userID: 5 }),
        ]);

        let { outOf, ranking } = await GetRankingInfo(chartID, 1, 50);

        t.equal(outOf, 5, "Should correctly determine we're out of 5 scores.");
        t.equal(ranking, 4, "Should correctly determine we're #4/5.");

        t.end();
    });

    t.test("#1 in Ranking Info for scores", async (t) => {
        // insert some fake scores - our percent is 50.

        await db["score-pbs"].insert([
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 90 }, userID: 1 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 60 }, userID: 2 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 70 }, userID: 3 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 80 }, userID: 4 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 40 }, userID: 5 }),
        ]);

        let { outOf, ranking } = await GetRankingInfo(chartID, 1, 90);

        t.equal(outOf, 5, "Should correctly determine we're out of 5 scores.");
        t.equal(ranking, 1, "Should correctly determine we're #1/5.");

        t.end();
    });

    t.test("#Last in Ranking Info for scores", async (t) => {
        // insert some fake scores - our percent is 50.

        await db["score-pbs"].insert([
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 0 }, userID: 1 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 60 }, userID: 2 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 70 }, userID: 3 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 80 }, userID: 4 }),
            deepmerge(TestingIIDXSPScorePB, { scoreData: { percent: 40 }, userID: 5 }),
        ]);

        let { outOf, ranking } = await GetRankingInfo(chartID, 1, 0);

        t.equal(outOf, 5, "Should correctly determine we're out of 5 scores.");
        t.equal(ranking, 5, "Should correctly determine we're #5/5.");

        t.end();
    });
    t.end();
});

t.teardown(CloseMongoConnection);
