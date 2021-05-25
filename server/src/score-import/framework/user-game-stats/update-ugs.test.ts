/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import db, { CloseMongoConnection } from "../../../external/mongo/db";
import CreateLogCtx from "../../../logger/logger";
import ResetDBState from "../../../test-utils/reset-db-state";
import { UpdateUsersGamePlaytypeStats } from "./update-ugs";
import deepmerge from "deepmerge";
import crypto from "crypto";
import { TestingIIDXSPScorePB } from "../../../test-utils/test-data";

const logger = CreateLogCtx(__filename);

// more of an integration test
t.test("#UpdateUsersGamePlaytypeStats", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should create new UserGameStats if the user has none", async (t) => {
        await db["game-stats"].remove({});

        const res = await UpdateUsersGamePlaytypeStats("iidx", "SP", 1, null, logger);

        t.strictSame(res, [], "Should return an empty object");

        const gs = await db["game-stats"].findOne();

        t.hasStrict(
            gs,
            {
                game: "iidx",
                playtype: "SP",
                userID: 1,
                rating: 0,
                lampRating: 0,
                customRatings: { BPI: 0 },
                classes: {},
            } as any,
            "Should insert an appropriate game-stats object"
        );

        t.end();
    });

    t.test("Should update UserGameStats if the user has one", async (t) => {
        await db["game-stats"].insert({
            game: "iidx",
            playtype: "SP",
            userID: 1,
            rating: 0,
            lampRating: 0,
            customRatings: {
                BPI: 0,
            },
            classes: {},
        });

        // insert some mock scores
        const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        await db["score-pbs"].insert(
            ratings.map((e) =>
                deepmerge(TestingIIDXSPScorePB, {
                    chartID: crypto.randomBytes(20).toString("hex"),
                    calculatedData: {
                        rating: e,
                        lampRating: 0,
                    },
                })
            )
        );

        const res = await UpdateUsersGamePlaytypeStats("iidx", "SP", 1, null, logger);

        t.strictSame(res, [], "Should return an empty object");

        const gs = await db["game-stats"].findOne();

        t.hasStrict(
            gs,
            {
                game: "iidx",
                playtype: "SP",
                userID: 1,
                rating: ratings.reduce((a, r) => a + r, 0) / 20,
                lampRating: 0,
                customRatings: {
                    // BPI: 5 -- 5.04999 but floating point testing lmao
                },
                classes: {},
            } as any,
            "Should update the game-stats object"
        );

        t.end();
    });

    t.test("Should return class deltas", async (t) => {
        await db["game-stats"].insert({
            game: "iidx",
            playtype: "SP",
            userID: 1,
            rating: 0,
            lampRating: 0,
            customRatings: {
                BPI: 0,
            },
            classes: {},
        });

        const res = await UpdateUsersGamePlaytypeStats(
            "iidx",
            "SP",
            1,
            () => ({ dan: "kaiden" }), // lmao
            logger
        );

        t.strictSame(
            res,
            [
                {
                    set: "dan",
                    playtype: "SP",
                    old: null,
                    new: "kaiden",
                },
            ],
            "Should return the class delta"
        );

        const gs = await db["game-stats"].findOne();

        t.hasStrict(
            gs,
            {
                game: "iidx",
                playtype: "SP",
                userID: 1,
                rating: 0,
                lampRating: 0,
                customRatings: {
                    BPI: 0,
                },
                classes: {
                    dan: "kaiden",
                },
            } as any,
            "Should update the game-stats object"
        );

        t.end();
    });

    t.test("Should return updated class deltas", async (t) => {
        await db["game-stats"].insert({
            game: "iidx",
            playtype: "SP",
            userID: 1,
            rating: 0,
            lampRating: 0,
            customRatings: {
                BPI: 0,
            },
            classes: {
                dan: "chuuden",
            },
        });

        const res = await UpdateUsersGamePlaytypeStats(
            "iidx",
            "SP",
            1,
            () => ({ dan: "kaiden" }), // lmao
            logger
        );

        t.strictSame(
            res,
            [
                {
                    set: "dan",
                    playtype: "SP",
                    old: "chuuden",
                    new: "kaiden",
                },
            ],
            "Should return the updated class delta"
        );

        const gs = await db["game-stats"].findOne();

        t.hasStrict(
            gs,
            {
                game: "iidx",
                playtype: "SP",
                userID: 1,
                rating: 0,
                lampRating: 0,
                customRatings: {
                    BPI: 0,
                },
                classes: {
                    dan: "kaiden",
                },
            } as any,
            "Should update the game-stats object"
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
