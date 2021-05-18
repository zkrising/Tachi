import Pr from "prudence";
import t from "tap";
import db, { CloseMongoConnection } from "../../../db/db";
import CreateLogCtx from "../../../logger";
import { prAssert } from "../../../test-utils/asserts";
import {
    Testing511SPA,
    TestingDoraChart,
    TestingGITADORADoraDryScore,
    TestingIIDXSPDryScore,
} from "../../../test-utils/test-data";
import { CreateCalculatedData, CalculateLampRating, CalculateRating } from "./calculated-data";
import deepmerge from "deepmerge";
import ResetDBState from "../../../test-utils/reset-db-state";
import { GetDefaultTierlist } from "../../../common/tierlist";

const mockLogger = CreateLogCtx("calculated-data.test.ts");

t.test("#CreateCalculatedData", async (t) => {
    const res = await CreateCalculatedData(TestingIIDXSPDryScore, Testing511SPA, 30, mockLogger);

    prAssert(
        res,
        {
            rating: Pr.aprx(2.65),
            lampRating: Pr.equalTo(10),
            gameSpecific: {
                BPI: "?number",
                KESDC: "?number",
                "K%": "?number",
            },
        },
        "Should correctly produce calculatedData"
    );

    const gitadoraRes = await CreateCalculatedData(
        TestingGITADORADoraDryScore,
        TestingDoraChart,
        30,
        mockLogger
    );

    prAssert(
        gitadoraRes,
        {
            rating: Pr.isPositiveNonZero,
            lampRating: Pr.equalTo(1.6),
            gameSpecific: {},
        },
        "Should correctly call rating function overrides for different games"
    );

    t.end();
});

t.test("#CalculateRating", (t) => {
    t.test("Should call the success calculator if percent > pivotPercent", async (t) => {
        const r = await CalculateRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 80 } }),
            "iidx",
            "SP",
            Testing511SPA,
            mockLogger
        );

        t.ok(r > 10, "Should return rating greater than the levelNum of the chart.");

        t.end();
    });

    t.test("Should call the fail calculator if percent > pivotPercent", async (t) => {
        const r = await CalculateRating(
            TestingIIDXSPDryScore,
            "iidx",
            "SP",
            Testing511SPA,
            mockLogger
        );

        t.ok(r < 10, "Should return rating less than the levelNum of the chart.");

        t.end();
    });

    t.test("Should call levelNum if percent === pivotPercent", async (t) => {
        const r = await CalculateRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 77.7777 } }),
            "iidx",
            "SP",
            Testing511SPA,
            mockLogger
        );

        t.equal(
            // hack for approximate tests
            parseFloat(r.toFixed(2)),
            10,
            "Should return rating exactly that of the levelNum of the chart."
        );

        t.end();
    });

    t.test(
        "Should trigger safety if completely invalid percent somehow gets through",
        async (t) => {
            let r = await CalculateRating(
                deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 1000000000 } }),
                "iidx",
                "SP",
                Testing511SPA,
                mockLogger
            );

            t.equal(r, 0, "Should safely return 0 and log a warning.");

            r = await CalculateRating(
                // not high enough to be non-finite but high enough to be > 1000
                deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 200 } }),
                "iidx",
                "SP",
                Testing511SPA,
                mockLogger
            );

            t.equal(r, 0, "Should safely return 0 and log a warning.");

            t.end();
        }
    );

    t.end();
});

t.test("#CalculateLampRating", async (t) => {
    t.beforeEach(ResetDBState);

    const defaultTierlist = await GetDefaultTierlist("iidx", "SP");

    if (!defaultTierlist) {
        throw new Error("Could not retrieve IIDX:SP default tierlist?");
    }

    t.test("TierlistData", async (t) => {
        const lampRating = await CalculateLampRating(
            TestingIIDXSPDryScore,
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRating, 10, "Should equal the levelNum of the chart.");

        const lampRatingFail = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "FAILED" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRatingFail, 0, "Should equal 0, if the score is not a clear.");

        const lampRatingHC = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "HARD CLEAR" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRatingHC, 10.6, "Should equal the tierlist value for HC on this chart.");

        const lampRatingEXHC = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "EX HARD CLEAR" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        // deliberate - there is no EXHC data here
        t.equal(lampRatingEXHC, 10.6, "Should equal the tierlist value for HC on this chart.");

        t.end();
    });

    t.test("TierlistData edge cases", async (t) => {
        // mock document that implies 5.1.1. SPA is worth 11.9 to NC and 10.6 to HC.
        await db["tierlist-data"].insert({
            chartID: Testing511SPA.chartID,
            type: "lamp",
            key: "CLEAR",
            tierlistDataID: "asdf",
            tierlistID: defaultTierlist!.tierlistID,
            data: {
                flags: {},
                humanised: "a",
                value: 11.9,
            },
        });

        const lampRating = await CalculateLampRating(
            TestingIIDXSPDryScore,
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRating, 11.9, "Should equal the NC value of the chart.");

        const lampRatingFail = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "FAILED" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRatingFail, 0, "Should equal 0, if the score is not a clear.");

        const lampRatingHC = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "HARD CLEAR" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(
            lampRatingHC,
            11.9,
            "Should equal the tierlist value for NC, as it is higher than HC on this chart."
        );

        const lampRatingEXHC = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "EX HARD CLEAR" } }),
            "iidx",
            "SP",
            Testing511SPA,
            defaultTierlist!.tierlistID
        );

        t.equal(lampRatingEXHC, 11.9, "Should equal the tierlist value for NC on this chart.");

        t.end();
    });

    t.test("No TierlistData", async (t) => {
        await db["tierlist-data"].remove({});
        const lampRating = await CalculateLampRating(
            TestingIIDXSPDryScore,
            "iidx",
            "SP",
            Testing511SPA
        );

        t.equal(lampRating, 10, "Should equal the levelNum of the chart.");

        const lampRatingFail = await CalculateLampRating(
            deepmerge(TestingIIDXSPDryScore, { scoreData: { lamp: "FAILED" } }),
            "iidx",
            "SP",
            Testing511SPA
        );

        t.equal(lampRatingFail, 0, "Should equal 0, if the score is not a clear.");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
