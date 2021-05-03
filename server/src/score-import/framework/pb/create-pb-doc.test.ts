import t from "tap";
import db, { CloseMongoConnection } from "../../../db/db";
import ResetDBState from "../../../test-utils/reset-db-state";
import {
    GetKTDataJSON,
    Testing511SPA,
    TestingIIDXSPScore,
    TestingIIDXSPScorePB,
} from "../../../test-utils/test-data";
import { CreatePBDoc, GetRankingInfo } from "./create-pb-doc";
import deepmerge from "deepmerge";
import CreateLogCtx from "../../../logger";
import { KtLogger } from "../../../types";
import { lamps } from "kamaitachi-common/js/config";

let IIDXScore = TestingIIDXSPScore;

const logger = CreateLogCtx("create-pb-doc.test.ts");

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

t.test("#CreatePBDoc", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => {
        // monk adds _id onto the file when you import it, so lets try and avoid that
        IIDXScore = GetKTDataJSON("./kamaitachi/iidx-score.json");
    });

    let chartID = Testing511SPA.chartID;

    const ExamplePBDoc = {
        chartID,
        userID: 1,
        songID: 1,
        outOf: 1,
        ranking: 1,
        highlight: false,
        isPrimary: true,
        game: "iidx",
        playtype: "SP",
        comments: [],
        composedFrom: {
            scorePB: IIDXScore.scoreID,
            lampPB: "LAMP_PB_ID",
        },
        scoreData: {
            score: IIDXScore.scoreData.score,
            percent: IIDXScore.scoreData.percent,
            esd: IIDXScore.scoreData.esd,
            grade: IIDXScore.scoreData.grade,
            gradeIndex: IIDXScore.scoreData.gradeIndex,
            hitData: IIDXScore.scoreData.hitData,
            lamp: "FULL COMBO",
            lampIndex: lamps.iidx.indexOf("FULL COMBO"),
            hitMeta: { bp: 1 },
        },
        calculatedData: {
            rating: IIDXScore.calculatedData.rating,
            lampRating: 12,
            gameSpecific: {},
        },
    };

    t.test(
        "(IIDX) Should use the GameSpecificMergeFN to also join the BP PB if necessary.",
        async (t) => {
            await db.scores.remove({});
            await db.scores.insert([
                IIDXScore,
                deepmerge(IIDXScore, {
                    scoreData: {
                        lamp: "FULL COMBO",
                        lampIndex: lamps.iidx.indexOf("FULL COMBO"),
                        score: 0,
                        percent: 0,
                        hitMeta: {
                            bp: 15,
                        },
                    },
                    calculatedData: {
                        lampRating: 12,
                    },
                    scoreID: "LAMP_PB_ID",
                }),
                deepmerge(IIDXScore, {
                    scoreData: {
                        lamp: "CLEAR",
                        lampIndex: lamps.iidx.indexOf("CLEAR"),
                        score: 1,
                        percent: 1,
                        hitMeta: {
                            bp: 5,
                        },
                    },
                    calculatedData: {
                        lampRating: 10,
                    },
                    scoreID: "BP_PB_ID",
                }),
            ]);

            let res = await CreatePBDoc(1, chartID, logger);

            t.not(res, undefined, "Should actually return something.");

            t.strictSame(
                res,
                deepmerge(ExamplePBDoc, {
                    composedFrom: {
                        other: [{ name: "Best BP", scoreID: "BP_PB_ID" }],
                    },
                    scoreData: {
                        hitMeta: {
                            bp: 5,
                        },
                    },
                }),
                "Should correctly return a merged PBDocument with BP"
            );

            t.end();
        }
    );

    t.test("Should merge a score and lamp PB into one document.", async (t) => {
        let d = deepmerge(IIDXScore, {
            scoreData: {
                lamp: "FULL COMBO",
                lampIndex: lamps.iidx.indexOf("FULL COMBO"),
                score: 0,
                percent: 0,
                hitMeta: {
                    bp: 1,
                },
            },
            calculatedData: {
                lampRating: 12,
            },
            scoreID: "LAMP_PB_ID",
        });

        await db.scores.remove({});
        await db.scores.insert([IIDXScore, d]);

        let res = await CreatePBDoc(1, chartID, logger);

        t.not(res, undefined, "Should actually return something.");

        t.strictSame(res, ExamplePBDoc, "Should correctly return a merged PBDocument");

        t.end();
    });

    t.test("Should bail safely if no score exists when one should", async (t) => {
        // a work of genius
        const fakeLogger = ({
            severe: () => (severeCalled = true),
        } as unknown) as KtLogger;

        let severeCalled = false;

        await db.scores.remove({});

        let res = await CreatePBDoc(1, chartID, fakeLogger);

        t.equal(res, undefined, "Should return nothing (and emit a warning)");

        t.equal(severeCalled, true, "Severe logging should have been called.");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
