import t from "tap";
import db, { CloseMongoConnection } from "../../../db/db";
import ResetDBState from "../../../test-utils/reset-db-state";
import { TestingIIDXSPScorePB } from "../../../test-utils/test-data";
import { CalculateCustomRatings, CalculateRatings } from "./rating";
import deepmerge from "deepmerge";
import CreateLogCtx from "../../../logger";
import crypto from "crypto";

const logger = CreateLogCtx("rating.test.ts");

t.test("#CalculateRatings", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return the average of your best 20.", async (t) => {
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

        const { rating } = await CalculateRatings("iidx", "SP", 1, logger);

        t.equal(
            rating,
            ratings.reduce((r, a) => a + r, 0) / 20,
            "Should equal the average of the best 20 ratings."
        );

        await db["score-pbs"].remove({});

        const lampRatings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 4, 1, 5, 2];

        await db["score-pbs"].insert(
            lampRatings.map((e) =>
                deepmerge(TestingIIDXSPScorePB, {
                    chartID: crypto.randomBytes(20).toString("hex"),
                    calculatedData: {
                        rating: 0,
                        lampRating: e,
                    },
                })
            )
        );

        const { lampRating } = await CalculateRatings("iidx", "SP", 1, logger);

        t.equal(
            lampRating,
            lampRatings.reduce((r, a) => a + r, 0) / 20,
            "Should equal the average of the best 20 lamp ratings."
        );

        t.end();
    });

    t.test("Should return the average of your best 20.", async (t) => {
        await db["score-pbs"].remove({});

        const { rating, lampRating } = await CalculateRatings("iidx", "SP", 1, logger);

        t.equal(rating, 0, "Should default to 0 for no scores.");
        t.equal(lampRating, 0, "Should default to 0 for no scores.");

        t.end();
    });

    t.end();
});

t.test("#CalculateCustomRatings", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should work for games with no custom ratings", async (t) => {
        const res = await CalculateCustomRatings("popn", "9B", 1, logger);

        t.strictSame(res, {}, "Should return an empty object.");

        t.end();
    });

    t.test("Should return BPI for IIDX", async (t) => {
        const res = await CalculateCustomRatings("iidx", "SP", 1, logger);

        t.strictSame(res, { BPI: 0 }, "Should return BPI as a custom key.");

        const resDP = await CalculateCustomRatings("iidx", "DP", 1, logger);

        t.strictSame(resDP, { BPI: 0 }, "Should return BPI as a custom key.");

        t.end();
    });

    t.test("Should return VF4 and VF5 for SDVX", async (t) => {
        const res = await CalculateCustomRatings("sdvx", "Single", 1, logger);

        t.strictSame(res, { VF4: 0, VF5: 0 }, "Should return VF4 and VF5 keys.");

        t.end();
    });

    t.test("Should return VF4 and VF5 for USC", async (t) => {
        const res = await CalculateCustomRatings("usc", "Single", 1, logger);

        t.strictSame(res, { VF4: 0, VF5: 0 }, "Should return VF4 and VF5 keys.");

        t.end();
    });

    t.test("Should return MFCP for DDR", async (t) => {
        const res = await CalculateCustomRatings("ddr", "SP", 1, logger);

        t.strictSame(res, { MFCP: 0 }, "Should return MFCP keys.");

        const resDP = await CalculateCustomRatings("ddr", "DP", 1, logger);

        t.strictSame(resDP, { MFCP: 0 }, "Should return MFCP keys.");

        t.end();
    });

    t.test("Should return skill for Gitadora", async (t) => {
        const res = await CalculateCustomRatings("gitadora", "Dora", 1, logger);

        t.strictSame(res, { skill: 0 }, "Should return skill keys.");

        const resDP = await CalculateCustomRatings("gitadora", "Gita", 1, logger);

        t.strictSame(resDP, { skill: 0 }, "Should return skill keys.");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
