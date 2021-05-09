import t from "tap";
import db, { CloseMongoConnection } from "../../../db/db";
import ResetDBState from "../../../test-utils/reset-db-state";
import {
    GetRelevantFolderGoals,
    GetRelevantGoals,
    ProcessGoalsForUser,
    UpdateUsersGoals,
    ProcessGoal,
} from "./goals";
import { GoalDocument, FolderDocument, UserGoalDocument } from "kamaitachi-common";
import { CreateFolderChartLookup } from "../../../core/folder-core";
import { GetKTDataJSON, Testing511SPA, TestingIIDXSPScorePB } from "../../../test-utils/test-data";
import deepmerge from "deepmerge";
import CreateLogCtx from "../../../logger";
import crypto from "crypto";
import { lamps } from "kamaitachi-common/js/config";

const logger = CreateLogCtx("goals.test.ts");

const HC511Goal: GoalDocument = {
    charts: {
        type: "single",
        data: Testing511SPA.chartID,
    },
    createdBy: 1,
    game: "iidx",
    goalID: "mock_goalID",
    playtype: "SP",
    timeAdded: 0,
    title: "HC 5.1.1. SPA",
    criteria: {
        mode: "single",
        value: lamps.iidx.indexOf("HARD CLEAR"),
        key: "scoreData.lampIndex",
    },
};

const HC511UserGoal: UserGoalDocument = {
    achieved: false,
    timeAchieved: null,
    game: "iidx",
    playtype: "SP",
    goalID: "mock_goalID",
    lastInteraction: null,
    outOf: 5,
    outOfHuman: "HARD CLEAR",
    progress: null,
    progressHuman: "NO DATA",
    timeSet: Date.now(),
    userID: 1,
};

t.test("#GetRelevantFolderGoals", (t) => {
    t.beforeEach(ResetDBState);

    const sp10folder: FolderDocument = {
        title: "Level 10",
        game: "iidx",
        playtype: "SP",
        type: "charts",
        folderID: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
        table: "Levels",
        tableIndex: 10,
        data: {
            level: "10",
            "flags¬IN BASE GAME": true,
        },
    };

    const fakeFolderGoalDocument: GoalDocument = {
        charts: {
            type: "folder",
            data: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
        },
        createdBy: 1,
        game: "iidx",
        goalID: "fake_goal_id",
        playtype: "SP",
        timeAdded: 0,
        title: "get > 1 ex score on any level 10.",
        criteria: {
            mode: "single",
            value: 1,
            key: "scoreData.score",
        },
    };

    const notFolderGoalDocument: GoalDocument = {
        charts: {
            type: "folder",
            data: "some_fake_folder_id",
        },
        createdBy: 1,
        game: "iidx",
        goalID: "fake_bad_goal_id",
        playtype: "SP",
        timeAdded: 0,
        title: "get > 1 ex score on some other folder.",
        criteria: {
            mode: "single",
            value: 1,
            key: "scoreData.score",
        },
    };

    t.beforeEach(async () => {
        const sp11folder = deepmerge(sp10folder, { data: { level: "11" } });
        await db.folders.insert(sp10folder);
        await db.folders.insert(sp11folder);
        await db.goals.insert(fakeFolderGoalDocument);
        await db.goals.insert(notFolderGoalDocument);
        await CreateFolderChartLookup(sp10folder);
        await CreateFolderChartLookup(sp11folder);
    });

    t.test("Should correctly find the goals on this folder.", async (t) => {
        let res = await GetRelevantFolderGoals(
            ["fake_goal_id", "fake_bad_goal_id"],
            [Testing511SPA.chartID]
        );

        t.strictSame(
            res,
            [fakeFolderGoalDocument],
            "Should correctly return only the 511 goal document."
        );

        t.end();
    });

    t.end();
});

t.test("#GetRelevantGoals", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(async () => {
        // use the real data so we have enough charts loaded for this to test properly.
        await db.songs.iidx.remove({});
        await db.charts.iidx.remove({});
        await db.charts.iidx.insert(GetKTDataJSON("./kamaitachi/ktblack-charts-iidx.json"));
        await db.songs.iidx.insert(GetKTDataJSON("./kamaitachi/ktblack-songs-iidx.json"));

        let lotsOfCharts = await db.charts.iidx.find({}, { limit: 20 });
        let goals: GoalDocument[] = lotsOfCharts.map((e) => ({
            charts: {
                type: "single",
                data: e.chartID,
            },
            createdBy: 1,
            game: "iidx",
            goalID: crypto.randomBytes(20).toString("hex"),
            playtype: "SP",
            timeAdded: 0,
            title: "get > 1 ex score on some other folder.",
            criteria: {
                mode: "single",
                value: 1,
                key: "scoreData.score",
            },
        }));

        await db.goals.insert(goals);

        await db["user-goals"].insert(
            goals.map((e) => ({
                achieved: false,
                timeAchieved: null,
                game: "iidx",
                playtype: "SP",
                goalID: e.goalID,
                lastInteraction: null,
                outOf: 5,
                outOfHuman: "HARD CLEAR",
                progress: null,
                progressHuman: "NO DATA",
                timeSet: Date.now(),
                userID: 1,
            }))
        );
    });

    t.test(
        "Should successfully filter goals to only those that are relevant to the session.",
        async (t) => {
            // lets pretend our session had scores on charts 0->4 and 20->25. We also only have goals on
            // charts 1->20, so only 5 of these should resolve.
            let ourCharts = [
                ...(await db.charts.iidx.find({}, { limit: 5 })),
                ...(await db.charts.iidx.find({}, { skip: 20, limit: 5 })),
            ];

            let chartIDs = new Set(ourCharts.map((e) => e.chartID));

            let res = await GetRelevantGoals("iidx", 1, chartIDs, logger);

            t.equal(res.goals.length, 5, "Should correctly resolve to 5 goals.");
            t.equal(res.userGoalsMap.size, 5, "Should also return 5 userGoals.");

            t.end();
        }
    );

    t.end();
});

t.todo("#ProcessGoalsForUser", (t) => {
    t.beforeEach(ResetDBState);

    t.end();
});

t.todo("#UpdateUsersGoals", (t) => {
    t.beforeEach(ResetDBState);

    t.end();
});

t.test("#ProcessGoal", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(async () => {
        await db.goals.insert(HC511Goal);
    });

    t.test("Should process the users goal if a score has changed.", async (t) => {
        await db["user-goals"].insert(HC511UserGoal);
        await db["score-pbs"].insert(TestingIIDXSPScorePB); // score is EX HARD CLEAR by default.

        let res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

        t.not(res, undefined, "Should NOT return undefined.");

        t.strictSame(
            res!.import,
            {
                goalID: "mock_goalID",
                old: {
                    progress: null,
                    progressHuman: "NO DATA",
                    outOf: 5,
                    outOfHuman: "HARD CLEAR",
                    achieved: false,
                },
                new: {
                    progress: 6,
                    progressHuman: "EX HARD CLEAR",
                    outOf: 5,
                    outOfHuman: "HARD CLEAR",
                    achieved: true,
                },
            },
            "Should return a valid import goal fragment."
        );

        t.end();
    });

    t.test("Should return undefined if there's no score.", async (t) => {
        await db["user-goals"].insert(HC511UserGoal);

        let res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

        t.equal(res, undefined, "Should return undefined.");

        t.end();
    });

    t.test("Should return undefined if the progress has not changed.", async (t) => {
        await db["user-goals"].insert(HC511UserGoal);
        await db["score-pbs"].insert(TestingIIDXSPScorePB);

        let firstUpdate = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

        // ignore this one
        t.not(firstUpdate, undefined, "Should NOT return undefined.");

        await db["user-goals"].bulkWrite([firstUpdate!.bwrite]);

        let userGoal = await db["user-goals"].findOne({ userID: 1, goalID: HC511Goal.goalID });

        let secondUpdate = await ProcessGoal(HC511Goal, userGoal!, 1, logger);

        t.equal(secondUpdate, undefined, "Should return undefined.");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
