import t from "tap";
import db from "../../../../external/mongo/db";
import ResetDBState from "../../../../test-utils/resets";
import { GetRelevantFolderGoals, GetRelevantGoals, UpdateGoalsForUser, ProcessGoal } from "./goals";
import { GoalDocument, UserGoalDocument } from "tachi-common";
import { CreateFolderChartLookup } from "../../../../utils/folder";
import {
    GetKTDataJSON,
    Testing511SPA,
    TestingIIDXSPScorePB,
    HC511Goal,
    HC511UserGoal,
    TestingIIDXFolderSP10,
} from "../../../../test-utils/test-data";
import deepmerge from "deepmerge";
import CreateLogCtx from "../../../logger/logger";
import crypto from "crypto";
import { CloseAllConnections } from "../../../../test-utils/close-connections";

const logger = CreateLogCtx(__filename);

t.test("#GetRelevantFolderGoals", (t) => {
    t.beforeEach(ResetDBState);

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
        // @ts-expect-error garbage types
        const sp11folder = deepmerge(TestingIIDXFolderSP10, { data: { level: "11" } });
        await db.folders.insert(TestingIIDXFolderSP10);
        await db.folders.insert(sp11folder);
        await db.goals.insert(fakeFolderGoalDocument);
        await db.goals.insert(notFolderGoalDocument);
        await CreateFolderChartLookup(TestingIIDXFolderSP10);
        await CreateFolderChartLookup(sp11folder);
    });

    t.test("Should correctly find the goals on this folder.", async (t) => {
        const res = await GetRelevantFolderGoals(
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
        await db.charts.iidx.insert(GetKTDataJSON("./tachi/ktblack-charts-iidx.json"));
        await db.songs.iidx.insert(GetKTDataJSON("./tachi/ktblack-songs-iidx.json"));

        const lotsOfCharts = await db.charts.iidx.find({}, { limit: 20 });
        const goals: GoalDocument[] = lotsOfCharts.map((e) => ({
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
            const ourCharts = [
                ...(await db.charts.iidx.find({}, { limit: 5 })),
                ...(await db.charts.iidx.find({}, { skip: 20, limit: 5 })),
            ];

            const chartIDs = new Set(ourCharts.map((e) => e.chartID));

            const res = await GetRelevantGoals("iidx", 1, chartIDs, logger);

            t.equal(res.goals.length, 5, "Should correctly resolve to 5 goals.");
            t.equal(res.userGoalsMap.size, 5, "Should also return 5 userGoals.");

            t.end();
        }
    );

    t.end();
});

t.test("#UpdateGoalsForUser", (t) => {
    t.beforeEach(ResetDBState);

    const baseGoalDocument: GoalDocument = {
        charts: {
            type: "single" as const,
            data: Testing511SPA.chartID,
        },
        createdBy: 1,
        game: "iidx",
        goalID: "FAKE_GOAL_ID",
        playtype: "SP",
        timeAdded: 0,
        title: "get > 1 ex score on some other folder.",
        criteria: {
            mode: "single",
            value: 1,
            key: "scoreData.score",
        },
    };

    const baseUserGoalDocument: UserGoalDocument = {
        achieved: false,
        game: "iidx",
        playtype: "SP",
        goalID: "FAKE_GOAL_ID",
        lastInteraction: null,
        outOf: 1,
        outOfHuman: "1",
        progress: 0,
        progressHuman: "0",
        timeAchieved: null,
        timeSet: 0,
        userID: 1,
    };

    t.test("Should correctly update goals when user achieves goal.", async (t) => {
        await db.goals.insert(baseGoalDocument);
        delete baseGoalDocument._id;

        await db["user-goals"].insert(baseUserGoalDocument);
        // we dont delete _id here because updategoalsforuser
        // depends on usergoal _id

        await db["personal-bests"].insert(TestingIIDXSPScorePB);
        delete TestingIIDXSPScorePB._id;

        const ugMap = new Map([["FAKE_GOAL_ID", baseUserGoalDocument]]);

        const res = await UpdateGoalsForUser([baseGoalDocument], ugMap, 1, logger);

        t.strictSame(res, [
            {
                goalID: "FAKE_GOAL_ID",
                old: {
                    progress: 0,
                    progressHuman: "0",
                    outOf: 1,
                    outOfHuman: "1",
                    achieved: false,
                },
                new: {
                    progress: 1479,
                    progressHuman: "1479",
                    outOf: 1,
                    outOfHuman: "1",
                    achieved: true,
                },
            },
        ]);

        const r = await db["user-goals"].findOne({ goalID: "FAKE_GOAL_ID", userID: 1 });

        t.hasStrict(
            r,
            {
                progress: 1479,
                progressHuman: "1479",
                outOf: 1,
                outOfHuman: "1",
                achieved: true,
            },
            "Should update goals in the database."
        );

        delete baseUserGoalDocument._id;

        t.end();
    });

    t.test("Should correctly update goals when user does not achieve goal.", async (t) => {
        const goal = deepmerge(baseGoalDocument, { criteria: { value: 2 } });
        await db.goals.insert(goal);

        const userGoal = deepmerge(baseUserGoalDocument, {
            outOf: 2,
            outOfHuman: "2",
        }) as unknown as UserGoalDocument;

        await db["user-goals"].insert(userGoal);
        // we dont delete _id here because updategoalsforuser
        // depends on usergoal _id

        await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, { scoreData: { score: 1 } }));

        const ugMap = new Map([["FAKE_GOAL_ID", userGoal]]);

        const res = await UpdateGoalsForUser([goal], ugMap, 1, logger);

        t.strictSame(res, [
            {
                goalID: "FAKE_GOAL_ID",
                old: {
                    progress: 0,
                    progressHuman: "0",
                    outOf: 2,
                    outOfHuman: "2",
                    achieved: false,
                },
                new: {
                    progress: 1,
                    progressHuman: "1",
                    outOf: 2,
                    outOfHuman: "2",
                    achieved: false,
                },
            },
        ]);

        const r = await db["user-goals"].findOne({ goalID: "FAKE_GOAL_ID", userID: 1 });

        t.hasStrict(
            r,
            {
                progress: 1,
                progressHuman: "1",
                outOf: 2,
                outOfHuman: "2",
                achieved: false,
            },
            "Should update goals in the database."
        );

        delete baseUserGoalDocument._id;

        t.end();
    });

    t.test("Should return [] if no data is to be changed.", async (t) => {
        const res = await UpdateGoalsForUser([], new Map(), 1, logger);

        t.strictSame(res, []);

        t.end();
    });

    t.test("Should handle (skip) goals if no usergoal is set.", async (t) => {
        const res = await UpdateGoalsForUser([baseGoalDocument], new Map(), 1, logger);

        t.strictSame(res, []);

        t.end();
    });

    t.test("Should handle (skip) invalid goals.", async (t) => {
        const res = await UpdateGoalsForUser(
            [deepmerge(baseGoalDocument, { charts: { type: "INVALID" } })],
            new Map([["FAKE_GOAL_ID", baseUserGoalDocument]]),
            1,
            logger
        );

        t.strictSame(res, []);

        t.end();
    });

    t.end();
});

t.todo("#GetAndUpdateUsersGoals", (t) => {
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
        await db["personal-bests"].insert(TestingIIDXSPScorePB); // score is EX HARD CLEAR by default.

        const res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

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
                    progressHuman: "EX HARD CLEAR (BP: 2)",
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

        const res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

        t.equal(res, undefined, "Should return undefined.");

        t.end();
    });

    t.test("Should return undefined if the progress has not changed.", async (t) => {
        await db["user-goals"].insert(HC511UserGoal);
        await db["personal-bests"].insert(TestingIIDXSPScorePB);

        const firstUpdate = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

        // ignore this one
        t.not(firstUpdate, undefined, "Should NOT return undefined.");

        await db["user-goals"].bulkWrite([firstUpdate!.bwrite]);

        const userGoal = await db["user-goals"].findOne({ userID: 1, goalID: HC511Goal.goalID });

        const secondUpdate = await ProcessGoal(HC511Goal, userGoal!, 1, logger);

        t.equal(secondUpdate, undefined, "Should return undefined.");

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
