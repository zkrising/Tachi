import t from "tap";
import db, { CloseMongoConnection } from "../db/db";
import CreateLogCtx from "../logger";
import ResetDBState from "../test-utils/reset-db-state";
import { EvaluateGoalForUser } from "./goal-core";
import { GoalDocument } from "kamaitachi-common";
import deepmerge from "deepmerge";
import {
    HC511Goal,
    Testing511SPA,
    TestingIIDXFolderSP10,
    TestingIIDXSPScorePB,
} from "../test-utils/test-data";
import { CreateFolderChartLookup } from "./folder-core";

const logger = CreateLogCtx("goal-core.test.ts");

t.test("#EvaluateGoalForUser", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should correctly evaluate against single goals.", (t) => {
        t.beforeEach(async () => {
            await db["score-pbs"].insert(TestingIIDXSPScorePB);
            delete TestingIIDXSPScorePB._id;
        });

        t.test("Should correctly evaluate goals if user succeeds.", async (t) => {
            let res = await EvaluateGoalForUser(HC511Goal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 6,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "EX HARD CLEAR",
                },
                "Should correctly evaluate the goal if the user succeeds."
            );

            t.end();
        });

        t.test("Should correctly evaluate goals if user fails.", async (t) => {
            await db["score-pbs"].update(
                { userID: 1, chartID: Testing511SPA.chartID },
                {
                    $set: {
                        "scoreData.lamp": "CLEAR",
                        "scoreData.lampIndex": 4,
                    },
                }
            );

            let res = await EvaluateGoalForUser(HC511Goal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 4,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "CLEAR",
                },
                "Should correctly evaluate the goal if the user fails."
            );

            t.end();
        });

        t.test("Should correctly evaluate goals when user has no score.", async (t) => {
            await db["score-pbs"].remove({});

            let res = await EvaluateGoalForUser(HC511Goal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: false,
                    outOf: 5,
                    progress: null,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "NO DATA",
                },
                "Should correctly evaluate the goal if the user has no score."
            );

            t.end();
        });

        t.end();
    });

    t.test("Should correctly evaluate against multi goals.", (t) => {
        // @ts-expect-error ???
        // this goal is effectively "HC any of the charts"
        let multiGoal: GoalDocument = deepmerge(HC511Goal, {
            charts: {
                type: "multi",
                data: [Testing511SPA.chartID, "fake_other_chart_id"],
            },
        });

        t.beforeEach(async () => {
            await db["score-pbs"].insert(TestingIIDXSPScorePB);
            delete TestingIIDXSPScorePB._id;

            await db["score-pbs"].insert(
                deepmerge(TestingIIDXSPScorePB, {
                    scoreData: { lamp: "CLEAR", lampIndex: 4 },
                    chartID: "fake_other_chart_id",
                })
            );
        });

        t.test("Should work if 511 is >= HARD CLEAR", async (t) => {
            let res = await EvaluateGoalForUser(multiGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 6,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "EX HARD CLEAR",
                },
                "Should correctly evaluate the goal if the user succeeds."
            );

            t.end();
        });

        t.test("Should work if other chart is >= HARD CLEAR", async (t) => {
            await db["score-pbs"].update(
                { userID: 1, chartID: Testing511SPA.chartID },
                { $set: { "scoreData.lamp": "CLEAR", "scoreData.lampIndex": 4 } }
            );
            await db["score-pbs"].update(
                { userID: 1, chartID: "fake_other_chart_id" },
                { $set: { "scoreData.lamp": "HARD CLEAR", "scoreData.lampIndex": 5 } }
            );

            let res = await EvaluateGoalForUser(multiGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 5,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "HARD CLEAR",
                },
                "Should correctly evaluate the goal if the user succeeds."
            );

            t.end();
        });

        t.test("Should work if user has no scores", async (t) => {
            await db["score-pbs"].remove({});

            let res = await EvaluateGoalForUser(multiGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: false,
                    outOf: 5,
                    progress: null,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "NO DATA",
                },
                "Should correctly evaluate the goal if the user has no data."
            );

            t.end();
        });

        t.end();
    });

    t.test("Should correctly evaluate against folder goals.", (t) => {
        // @ts-expect-error ???
        // this goal is effectively "HC any of the sp10s"
        let folderGoal: GoalDocument = deepmerge(HC511Goal, {
            charts: {
                type: "folder",
                data: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
            },
        });

        t.beforeEach(async () => {
            await db["score-pbs"].insert(TestingIIDXSPScorePB);
            delete TestingIIDXSPScorePB._id;

            await db["score-pbs"].insert(
                deepmerge(TestingIIDXSPScorePB, {
                    scoreData: { lamp: "CLEAR", lampIndex: 4 },
                    chartID: "other_sp10",
                })
            );

            delete Testing511SPA._id;

            await db.charts.iidx.insert([
                // @ts-expect-error ???
                deepmerge(Testing511SPA, {
                    songID: 123,
                    level: "9",
                    chartID: "not_sp10",
                }),
                // @ts-expect-error ???
                deepmerge(Testing511SPA, {
                    songID: 124,
                    level: "10",
                    chartID: "other_sp10",
                }),
            ]);

            await CreateFolderChartLookup(TestingIIDXFolderSP10);
        });

        t.test("Should work if 511 is >= HARD CLEAR", async (t) => {
            let res = await EvaluateGoalForUser(folderGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 6,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "EX HARD CLEAR",
                },
                "Should correctly evaluate the goal if the user succeeds."
            );

            t.end();
        });

        t.test("Should work if other chart is >= HARD CLEAR", async (t) => {
            await db["score-pbs"].update(
                { userID: 1, chartID: Testing511SPA.chartID },
                { $set: { "scoreData.lamp": "CLEAR", "scoreData.lampIndex": 4 } }
            );

            await db["score-pbs"].update(
                { userID: 1, chartID: "other_sp10" },
                { $set: { "scoreData.lamp": "HARD CLEAR", "scoreData.lampIndex": 5 } }
            );

            let res = await EvaluateGoalForUser(folderGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: true,
                    outOf: 5,
                    progress: 5,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "HARD CLEAR",
                },
                "Should correctly evaluate the goal if the user succeeds."
            );

            t.end();
        });

        t.test("Should work if user has no scores", async (t) => {
            await db["score-pbs"].remove({});

            let res = await EvaluateGoalForUser(folderGoal, 1, logger);

            t.strictSame(
                res,
                {
                    achieved: false,
                    outOf: 5,
                    progress: null,
                    outOfHuman: "HARD CLEAR",
                    progressHuman: "NO DATA",
                },
                "Should correctly evaluate the goal if the user has no data."
            );

            t.end();
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
