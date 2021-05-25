import t from "tap";
import db, { CloseMongoConnection } from "../../../../external/mongo/db";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataJSON, Testing511SPA, TestingIIDXSPScore } from "../../../../test-utils/test-data";
import { CreatePBDoc } from "./create-pb-doc";
import deepmerge from "deepmerge";
import CreateLogCtx from "../../../../logger/logger";
import { KtLogger } from "../../../../utils/types";
import { lamps } from "kamaitachi-common/js/config";

let IIDXScore = TestingIIDXSPScore;

const logger = CreateLogCtx(__filename);

t.test("#CreatePBDoc", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => {
        // monk adds _id onto the file when you import it, so lets try and avoid that
        IIDXScore = GetKTDataJSON("./kamaitachi/iidx-score.json");
    });

    const chartID = Testing511SPA.chartID;

    const ExamplePBDoc = {
        chartID,
        userID: 1,
        songID: 1,
        // rankingInfo -- is not present because it is not added until post-processing.
        highlight: false,
        isPrimary: true,
        timeAchieved: null,
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

            const res = await CreatePBDoc(1, chartID, logger);

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
                            gsm: null,
                            gauge: null,
                            gaugeHistory: null,
                        },
                    },
                }),
                "Should correctly return a merged PBDocument with BP"
            );

            t.end();
        }
    );

    t.test("Should merge a score and lamp PB into one document.", async (t) => {
        const d = deepmerge(IIDXScore, {
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

        const res = await CreatePBDoc(1, chartID, logger);

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

        const res = await CreatePBDoc(1, chartID, fakeLogger);

        t.equal(res, undefined, "Should return nothing (and emit a warning)");

        t.equal(severeCalled, true, "Severe logging should have been called.");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
