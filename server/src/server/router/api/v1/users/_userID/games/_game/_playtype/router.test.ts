import t from "tap";
import db from "../../../../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../../../../test-utils/resets";
import {
    ScoreDocument,
    UserGoalDocument,
    GoalDocument,
    MilestoneDocument,
    UserMilestoneDocument,
    PBScoreDocument,
} from "tachi-common";
import { Testing511Song, Testing511SPA } from "../../../../../../../../../test-utils/test-data";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return a users statistics for that game.", async (t) => {
        const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP");

        t.hasStrict(res.body, {
            success: true,
            description: "Retrieved user statistics for test_zkldi (iidx SP)",
            body: {
                gameStats: {
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    classes: {},
                    ratings: {},
                },
                firstScore: null,
                mostRecentScore: null,
                totalScores: 1,
                rankingData: {
                    ranking: 1,
                    outOf: 1,
                },
            },
        });

        t.end();
    });

    t.test("Should return a users first score if one exists.", async (t) => {
        await db.scores.insert([
            {
                userID: 1,
                timeAchieved: 100,
                scoreID: "foo",
                game: "iidx",
                playtype: "SP",
            },
            {
                userID: 1,
                timeAchieved: 200,
                scoreID: "bar",
                game: "iidx",
                playtype: "SP",
            },
            {
                userID: 1,
                timeAchieved: 300,
                scoreID: "baz",
                game: "iidx",
                playtype: "SP",
            },
        ] as ScoreDocument[]);

        const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP");

        t.hasStrict(res.body, {
            success: true,
            description: "Retrieved user statistics for test_zkldi (iidx SP)",
            body: {
                gameStats: {
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    classes: {},
                    ratings: {},
                },
                firstScore: {
                    timeAchieved: 100,
                    scoreID: "foo",
                },
                mostRecentScore: {
                    timeAchieved: 300,
                    scoreID: "baz",
                },
                totalScores: 4,
                rankingData: {
                    ranking: 1,
                    outOf: 1,
                },
            },
        });

        t.end();
    });

    t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/goals", (t) => {
    t.beforeEach(ResetDBState);

    t.test(
        "Should return all of a users goals, and only unachieved goals if the argument is set.",
        async (t) => {
            await db["user-goals"].insert([
                {
                    goalID: "foo",
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    achieved: false,
                },
                {
                    goalID: "bar",
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    achieved: true,
                },
            ] as UserGoalDocument[]);

            await db.goals.insert([{ goalID: "foo" }, { goalID: "bar" }] as GoalDocument[]);

            const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/goals");

            t.hasStrict(res.body, {
                success: true,
                description: "Successfully returned 2 goal(s).",
                body: {
                    userGoals: [
                        {
                            goalID: "foo",
                            achieved: false,
                        },
                        {
                            goalID: "bar",
                            achieved: true,
                        },
                    ],
                    goals: [{ goalID: "bar" }, { goalID: "foo" }],
                },
            });

            const resUnachieved = await mockApi.get(
                "/api/v1/users/1/games/iidx/SP/goals?unachieved=true"
            );

            t.hasStrict(resUnachieved.body, {
                success: true,
                description: "Successfully returned 1 goal(s).",
                body: {
                    userGoals: [
                        {
                            goalID: "foo",
                            achieved: false,
                        },
                    ],
                    goals: [{ goalID: "foo" }],
                },
            });

            t.end();
        }
    );

    t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/milestones", (t) => {
    t.beforeEach(ResetDBState);

    t.test(
        "Should return all of a users milestones, and only unachieved milestones if the argument is set.",
        async (t) => {
            await db["user-milestones"].insert([
                {
                    milestoneID: "foo",
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    achieved: false,
                },
                {
                    milestoneID: "bar",
                    userID: 1,
                    game: "iidx",
                    playtype: "SP",
                    achieved: true,
                },
            ] as UserMilestoneDocument[]);

            await db.milestones.insert([
                { milestoneID: "foo" },
                { milestoneID: "bar" },
            ] as MilestoneDocument[]);

            const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/milestones");

            t.hasStrict(res.body, {
                success: true,
                description: "Successfully returned 2 milestone(s).",
                body: {
                    userMilestones: [
                        {
                            milestoneID: "foo",
                            achieved: false,
                        },
                        {
                            milestoneID: "bar",
                            achieved: true,
                        },
                    ],
                    milestones: [{ milestoneID: "bar" }, { milestoneID: "foo" }],
                },
            });

            const resUnachieved = await mockApi.get(
                "/api/v1/users/1/games/iidx/SP/milestones?unachieved=true"
            );

            t.hasStrict(resUnachieved.body, {
                success: true,
                description: "Successfully returned 1 milestone(s).",
                body: {
                    userMilestones: [
                        {
                            milestoneID: "foo",
                            achieved: false,
                        },
                    ],
                    milestones: [{ milestoneID: "foo" }],
                },
            });

            t.end();
        }
    );

    t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/scores/recent", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return a users 100 most recent scores.", async (t) => {
        const mockScores: ScoreDocument[] = [];

        for (let i = 0; i < 200; i++) {
            mockScores.push({
                userID: 1,
                game: "iidx",
                playtype: "SP",
                timeAchieved: i * 100,
                scoreID: `scoreID_${i}`,
                chartID: Testing511SPA.chartID,
                songID: Testing511Song.id,
            } as ScoreDocument);
        }

        await db.scores.insert(mockScores);

        for (const sc of mockScores) {
            delete sc._id; // lol
        }

        const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/scores/recent");

        t.hasStrict(res.body, {
            success: true,
            description: "Retrieved 100 scores.",
            body: {
                scores: mockScores.slice(100).reverse(),
                songs: [Testing511Song],
                charts: [Testing511SPA],
            },
        });

        t.end();
    });

    t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/best", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return a users 100 most recent scores.", async (t) => {
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
                    ktRating: i,
                },
            } as PBScoreDocument);
        }

        await db["personal-bests"].insert(mockPBs);

        for (const sc of mockPBs) {
            delete sc._id; // lol
        }

        const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/best");

        t.hasStrict(res.body, {
            success: true,
            description: "Retrieved 100 scores.",
            body: {
                scores: mockPBs.slice(100).reverse(),
                songs: [Testing511Song],
                charts: [],
            },
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
