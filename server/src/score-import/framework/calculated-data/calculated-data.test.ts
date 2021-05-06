import Pr from "prudence";
import t from "tap";
import { CloseMongoConnection } from "../../../db/db";
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

const mockLogger = CreateLogCtx("calculated-data.test.ts");

t.test("#CreateCalculatedData", async (t) => {
    let res = await CreateCalculatedData(TestingIIDXSPDryScore, Testing511SPA, mockLogger);

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

    let gitadoraRes = await CreateCalculatedData(
        TestingGITADORADoraDryScore,
        TestingDoraChart,
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
        let r = await CalculateRating(
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
        let r = await CalculateRating(
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
        let r = await CalculateRating(
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

t.teardown(CloseMongoConnection);
