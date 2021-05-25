import Pr from "prudence";
import t from "tap";
import { CloseMongoConnection } from "../../../external/mongo/db";
import CreateLogCtx from "../../../common/logger";
import { prAssert } from "../../../test-utils/asserts";
import {
    Testing511SPA,
    TestingIIDXSPDryScore,
    TestingSDVXSingleDryScore,
} from "../../../test-utils/test-data";
import { CreateGameSpecific } from "./game-specific";
const logger = CreateLogCtx(__filename);

/**
 * These tests only check that the right properties are assigned.
 */
t.test("#CreateGameSpecific", (t) => {
    t.test("IIDX:SP", async (t) => {
        const res = await CreateGameSpecific(
            "iidx",
            "SP",
            Testing511SPA,
            TestingIIDXSPDryScore,
            30,
            logger
        );

        prAssert(
            res,
            {
                BPI: "?number",
                "K%": "?number",
                KESDC: "?number",
            },
            "Response should contain keys for IIDX:SP GameSpecifics"
        );

        t.end();
    });

    t.test("IIDX:DP", async (t) => {
        const res = await CreateGameSpecific(
            "iidx",
            "DP",
            Testing511SPA,
            TestingIIDXSPDryScore, // fake! this is an SP score. but we're testing
            30,
            logger
        );

        prAssert(
            res,
            {
                BPI: "?number",
                KESDC: "?number",
            },
            "Response should contain keys for IIDX:DP GameSpecifics"
        );

        t.end();
    });

    t.test("SDVX:Single", async (t) => {
        const res = await CreateGameSpecific(
            "sdvx",
            "Single",
            Testing511SPA,
            TestingSDVXSingleDryScore,
            null,
            logger
        );

        prAssert(
            res,
            {
                VF4: Pr.nullable(Pr.isPositiveInteger),
                VF5: Pr.nullable(Pr.isPositive),
            },
            "Response should contain keys for SDVX:Single GameSpecifics"
        );

        t.end();
    });

    t.test("DDR:SP", async (t) => {
        const res = await CreateGameSpecific(
            "ddr",
            "SP",
            Testing511SPA,
            TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
            null,
            logger
        );

        prAssert(
            res,
            {
                MFCP: Pr.nullable(Pr.isPositiveInteger),
            },
            "Response should contain keys for DDR:SP GameSpecifics"
        );

        t.end();
    });

    t.test("DDR:DP", async (t) => {
        const res = await CreateGameSpecific(
            "ddr",
            "DP",
            Testing511SPA,
            TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
            null,
            logger
        );

        prAssert(
            res,
            {
                MFCP: "null",
            },
            "Response should contain nulled keys for DDR:DP GameSpecifics"
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
