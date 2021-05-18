import t from "tap";
import db, { CloseMongoConnection } from "../../../db/db";
import CreateLogCtx from "../../../logger";
import ResetDBState from "../../../test-utils/reset-db-state";
import { TestingIIDXSPMilestone } from "../../../test-utils/test-data";
import { UpdateUsersMilestones } from "./milestones";
import { GoalImportInfo } from "kamaitachi-common";
import deepmerge from "deepmerge";

const logger = CreateLogCtx("milestones.test.ts");

function CreateMockGII(...garr: [string, boolean][]) {
    return (garr.map((e) => ({
        goalID: e[0],
        old: {},
        new: { achieved: e[1] },
    })) as unknown) as GoalImportInfo[];
}

t.test("#UpdateUsersMilestones", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(() => db.milestones.insert(TestingIIDXSPMilestone));
    t.beforeEach(() =>
        db["user-milestones"].insert({
            achieved: false,
            game: "iidx",
            milestoneID: TestingIIDXSPMilestone.milestoneID,
            playtype: "SP",
            progress: 0,
            timeAchieved: null,
            timeSet: 0,
            userID: 1,
        })
    );

    t.test("Test with clean achieved milestone.", async (t) => {
        const res = await UpdateUsersMilestones(
            CreateMockGII(
                ["eg_goal_1", true],
                ["eg_goal_2", true],
                ["eg_goal_3", true],
                ["eg_goal_4", true]
            ),
            "iidx",
            ["SP"],
            1,
            logger
        );

        t.strictSame(
            res,
            [
                {
                    milestoneID: "example_milestone_id",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
            ],
            "Should correctly assert the milestone is achieved."
        );

        t.end();
    });

    t.test("Test with unclean achieved milestone.", async (t) => {
        const res = await UpdateUsersMilestones(
            CreateMockGII(
                ["eg_goal_1", true],
                ["eg_goal_2", true],
                ["eg_goal_3", true],
                ["eg_goal_4", true],
                ["x_goal_1", true],
                ["x_goal_2", true],
                ["x_goal_3", true]
            ),
            "iidx",
            ["SP"],
            1,
            logger
        );

        t.strictSame(
            res,
            [
                {
                    milestoneID: "example_milestone_id",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
            ],
            "Should correctly assert the milestone is achieved."
        );

        t.end();
    });

    t.test("Test with increased progress on milestone.", async (t) => {
        const res = await UpdateUsersMilestones(
            CreateMockGII(["eg_goal_1", true], ["eg_goal_2", true]),
            "iidx",
            ["SP"],
            1,
            logger
        );

        t.strictSame(
            res,
            [
                {
                    milestoneID: "example_milestone_id",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 2,
                        achieved: false,
                    },
                },
            ],
            "Should correctly assert the milestone progress has increased."
        );

        t.end();
    });

    t.test("Test with no new goals on milestone.", async (t) => {
        const res = await UpdateUsersMilestones([], "iidx", ["SP"], 1, logger);

        t.strictSame(res, [], "Should correctly return no changes.");

        t.end();
    });

    t.test("Test with new goals on multiple milestones.", async (t) => {
        delete TestingIIDXSPMilestone._id;
        await db.milestones.insert(
            // @ts-expect-error lol
            deepmerge(TestingIIDXSPMilestone, {
                milestoneID: "some_other_milestone_with_mutual_goals",
            })
        );
        await db["user-milestones"].insert({
            achieved: false,
            game: "iidx",
            milestoneID: "some_other_milestone_with_mutual_goals",
            playtype: "SP",
            progress: 0,
            timeAchieved: null,
            timeSet: 0,
            userID: 1,
        });

        const res = await UpdateUsersMilestones(
            CreateMockGII(
                ["eg_goal_1", true],
                ["eg_goal_2", true],
                ["eg_goal_3", true],
                ["eg_goal_4", true],
                ["x_goal_1", true],
                ["x_goal_2", true],
                ["x_goal_3", true]
            ),
            "iidx",
            ["SP", "DP"],
            1,
            logger
        );

        t.strictSame(
            res,
            [
                {
                    milestoneID: "example_milestone_id",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
                {
                    milestoneID: "some_other_milestone_with_mutual_goals",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
            ],
            "Should correctly assert the milestones are achieved."
        );
        t.end();
    });

    t.test("Test with multiple milestones that only some match", async (t) => {
        delete TestingIIDXSPMilestone._id;
        await db.milestones.insert([
            // @ts-expect-error lol
            deepmerge(TestingIIDXSPMilestone, {
                milestoneID: "some_other_milestone_with_mutual_goals",
            }),
            deepmerge(
                TestingIIDXSPMilestone,
                {
                    milestoneID: "dp_milestone",
                    playtype: "DP",
                    milestoneData: [
                        {
                            goals: [{ goalID: "foobar" }],
                        },
                    ],
                },
                { arrayMerge: (d, s) => s }
            ),
            deepmerge(
                TestingIIDXSPMilestone,
                {
                    milestoneID: "other_game_milestone",
                    game: "museca",
                    playtype: "Single",
                    milestoneData: [
                        {
                            goals: [{ goalID: "foo" }],
                        },
                    ],
                },
                { arrayMerge: (d, s) => s }
            ),
            deepmerge(
                TestingIIDXSPMilestone,
                {
                    milestoneID: "iidx_with_not_goal",
                    game: "iidx",
                    playtype: "SP",
                    milestoneData: [
                        {
                            goals: [{ goalID: "not_real_goal_id" }],
                        },
                    ],
                },
                { arrayMerge: (d, s) => s }
            ),
        ]);

        await db["user-milestones"].insert([
            {
                achieved: false,
                game: "iidx",
                milestoneID: "some_other_milestone_with_mutual_goals",
                playtype: "SP",
                progress: 0,
                timeAchieved: null,
                timeSet: 0,
                userID: 1,
            },
            {
                achieved: false,
                game: "iidx",
                milestoneID: "dp_milestone",
                playtype: "DP",
                progress: 0,
                timeAchieved: null,
                timeSet: 0,
                userID: 1,
            },
            {
                achieved: false,
                game: "museca",
                milestoneID: "other_game_milestone",
                playtype: "Single",
                progress: 0,
                timeAchieved: null,
                timeSet: 0,
                userID: 1,
            },
            {
                achieved: false,
                game: "iidx",
                milestoneID: "iidx_with_not_goal",
                playtype: "SP",
                progress: 0,
                timeAchieved: null,
                timeSet: 0,
                userID: 1,
            },
        ]);

        const res = await UpdateUsersMilestones(
            CreateMockGII(
                ["eg_goal_1", true],
                ["eg_goal_2", true],
                ["eg_goal_3", true],
                ["eg_goal_4", true],
                ["x_goal_1", true],
                ["x_goal_2", true],
                ["x_goal_3", true]
            ),
            "iidx",
            ["SP", "DP"],
            1,
            logger
        );

        t.strictSame(
            res,
            [
                {
                    milestoneID: "example_milestone_id",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
                {
                    milestoneID: "some_other_milestone_with_mutual_goals",
                    old: {
                        progress: 0,
                        achieved: false,
                    },
                    new: {
                        progress: 4,
                        achieved: true,
                    },
                },
            ],
            "Should correctly assert the milestones are achieved."
        );
        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
