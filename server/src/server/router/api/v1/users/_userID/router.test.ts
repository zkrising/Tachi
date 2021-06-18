import t from "tap";
import db from "../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../test-utils/resets";
import { UserGameStats } from "tachi-common";

t.test("GET /api/v1/users/:userID", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should retrieve a user on their ID.", async (t) => {
        const res = await mockApi.get("/api/v1/users/1");

        t.hasStrict(res.body, {
            success: true,
            description: "Found user test_zkldi.",
            body: {
                id: 1,
                username: "test_zkldi",
            },
        });

        t.end();
    });

    t.test("Should retrieve a user on their name.", async (t) => {
        const res = await mockApi.get("/api/v1/users/test_zkldi");

        t.hasStrict(res.body, {
            success: true,
            description: "Found user test_zkldi.",
            body: {
                id: 1,
                username: "test_zkldi",
            },
        });

        t.end();
    });

    t.test("Should retrieve a user on their name case insensitively.", async (t) => {
        const res = await mockApi.get("/api/v1/users/TeSt_ZklDI");

        t.hasStrict(res.body, {
            success: true,
            description: "Found user test_zkldi.",
            body: {
                id: 1,
                username: "test_zkldi",
            },
        });

        t.end();
    });

    t.test("Should return 404 on users that don't exist.", async (t) => {
        const res = await mockApi.get("/api/v1/users/someguy");

        t.hasStrict(res.body, {
            success: false,
            description: "The user someguy does not exist.",
        });

        t.equal(res.statusCode, 404);

        t.end();
    });

    t.end();
});

t.test("GET /api/v1/users/:userID/game-stats", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return all of a user's game stats.", async (t) => {
        await db["game-stats"].remove({});

        const stats: UserGameStats[] = [
            {
                userID: 1,
                game: "iidx",
                playtype: "SP",
                classes: {},
                ratings: {
                    ktRating: 12,
                },
            },
            {
                userID: 1,
                game: "iidx",
                playtype: "DP",
                classes: {},
                ratings: {
                    ktRating: 11,
                },
            },
            {
                userID: 1,
                game: "gitadora",
                playtype: "Dora",
                classes: {},
                ratings: {
                    skill: 4843,
                },
            },
        ];

        await db["game-stats"].insert(stats);

        for (const s of stats) {
            delete s._id;
        }

        const res = await mockApi.get("/api/v1/users/test_zkldi/game-stats");

        t.hasStrict(res.body, {
            success: true,
            description: "Returned 3 stats objects.",
        });

        const returns = res.body.body.map((e: UserGameStats) => `${e.game}-${e.playtype}`);

        // amusing small hacks
        t.equal(returns.length, 3);
        t.ok(returns.includes("iidx-SP"));
        t.ok(returns.includes("iidx-DP"));
        t.ok(returns.includes("gitadora-Dora"));

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
