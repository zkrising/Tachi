/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import db, { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataJSON, Testing511Song, Testing511SPA } from "../../../../test-utils/test-data";
import { InternalFailure } from "../../../framework/common/converter-failures";
import {
    ConverterIRFervidex,
    SplitFervidexChartRef,
    KtchifyAssist,
    KtchifyGauge,
    KtchifyRandom,
    KtchifyRange,
} from "./converter";
import { FervidexScore } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx("converter.test.ts");

t.test("#SplitFervidexChartRef", (t) => {
    t.strictSame(SplitFervidexChartRef("spb"), { playtype: "SP", difficulty: "BEGINNER" });
    t.strictSame(SplitFervidexChartRef("spn"), { playtype: "SP", difficulty: "NORMAL" });
    t.strictSame(SplitFervidexChartRef("sph"), { playtype: "SP", difficulty: "HYPER" });
    t.strictSame(SplitFervidexChartRef("spa"), { playtype: "SP", difficulty: "ANOTHER" });
    t.strictSame(SplitFervidexChartRef("spl"), { playtype: "SP", difficulty: "LEGGENDARIA" });
    t.strictSame(SplitFervidexChartRef("dpn"), { playtype: "DP", difficulty: "NORMAL" });
    t.strictSame(SplitFervidexChartRef("dph"), { playtype: "DP", difficulty: "HYPER" });
    t.strictSame(SplitFervidexChartRef("dpa"), { playtype: "DP", difficulty: "ANOTHER" });
    t.strictSame(SplitFervidexChartRef("dpl"), { playtype: "DP", difficulty: "LEGGENDARIA" });

    t.throws(
        () => SplitFervidexChartRef("INVALID" as "spn"),
        new InternalFailure(`Invalid fervidex difficulty of INVALID`) as any
    );

    t.end();
});

t.test("#KtchifyAssist", (t) => {
    t.equal(KtchifyAssist("ASCR_LEGACY"), "FULL ASSIST");
    t.equal(KtchifyAssist("AUTO_SCRATCH"), "AUTO SCRATCH");
    t.equal(KtchifyAssist("FULL_ASSIST"), "FULL ASSIST");
    t.equal(KtchifyAssist("LEGACY_NOTE"), "LEGACY NOTE");
    t.equal(KtchifyAssist(null), "NO ASSIST");
    t.equal(KtchifyAssist(undefined), "NO ASSIST");

    t.end();
});

t.test("#KtchifyGauge", (t) => {
    t.equal(KtchifyGauge("ASSISTED_EASY"), "ASSISTED EASY");
    t.equal(KtchifyGauge("EASY"), "EASY");
    t.equal(KtchifyGauge("HARD"), "HARD");
    t.equal(KtchifyGauge("EX_HARD"), "EX HARD");
    t.equal(KtchifyGauge(null), "NORMAL");
    t.equal(KtchifyGauge(undefined), "NORMAL");

    t.end();
});

t.test("#KtchifyRange", (t) => {
    t.equal(KtchifyRange("HIDDEN_PLUS"), "HIDDEN+");
    t.equal(KtchifyRange("LIFT"), "LIFT");
    t.equal(KtchifyRange("LIFT_SUD_PLUS"), "LIFT SUD+");
    t.equal(KtchifyRange("SUDDEN_PLUS"), "SUDDEN+");
    t.equal(KtchifyRange("SUD_PLUS_HID_PLUS"), "SUD+ HID+");
    t.equal(KtchifyRange(null), "NONE");
    t.equal(KtchifyRange(undefined), "NONE");

    t.end();
});

t.test("#KtchifyRandom", (t) => {
    t.equal(KtchifyRandom("MIRROR"), "MIRROR");
    t.equal(KtchifyRandom("R_RANDOM"), "R-RANDOM");
    t.equal(KtchifyRandom("S_RANDOM"), "S-RANDOM");
    t.equal(KtchifyRandom("RANDOM"), "RANDOM");
    t.equal(KtchifyRandom(null), "NONRAN");
    t.equal(KtchifyRandom(undefined), "NONRAN");

    t.end();
});

const baseFervidexScore: FervidexScore = GetKTDataJSON("./fervidex/base.json");

const baseDryScore = {
    game: "iidx",
    service: "Fervidex",
    comment: null,
    importType: "ir/fervidex",
    scoreData: {
        score: 68,
        percent: 4.325699745547074,
        grade: "F",
        lamp: "FAILED",
        hitData: {
            pgreat: 34,
            great: 0,
            good: 0,
            bad: 0,
            poor: 6,
        },
        hitMeta: {
            fast: 0,
            slow: 0,
            maxCombo: 34,
            gaugeHistory: [100, 50],
            gauge: 50,
            bp: 6,
            comboBreak: null,
            gsm: undefined,
        },
    },
    scoreMeta: {
        assist: "NO ASSIST",
        gauge: "HARD",
        random: "RANDOM",
        range: "SUDDEN+",
    },
};

t.test("#ConverterIRFervidex", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should convert a valid fervidex score into a dry score.", async (t) => {
        const res = await ConverterIRFervidex(
            baseFervidexScore,
            { version: "27" },
            "ir/fervidex",
            logger
        );

        t.hasStrict(
            res,
            {
                song: Testing511Song,
                chart: Testing511SPA,
                dryScore: baseDryScore,
            } as any, // broken
            "Should return a dry score."
        );

        t.end();
    });

    t.test("Should reject scores on unknown charts", (t) => {
        t.rejects(
            ConverterIRFervidex(
                deepmerge(baseFervidexScore, { chart: "spl" }),
                { version: "27" },
                "ir/fervidex",
                logger
            ),
            { message: /could not find chart/giu } as any
        );

        t.end();
    });

    t.test("Should throw internal failure on chart-song desync", async (t) => {
        await db.songs.iidx.remove({}); // this forces desync

        t.rejects(
            ConverterIRFervidex(baseFervidexScore, { version: "27" }, "ir/fervidex", logger),
            { message: /Song 1 \(iidx\) has no parent song/giu } as any
        );

        t.end();
    });

    t.test("Should throw invalid score on percent > 100.", (t) => {
        t.rejects(
            ConverterIRFervidex(
                // @ts-expect-error eternally broken deepmerge
                deepmerge(baseFervidexScore, { ex_score: 9999 }),
                { version: "27" },
                "ir/fervidex",
                logger
            ),
            { message: /Invalid score of 9999 for chart.*Resulted in percent/giu } as any
        );

        t.end();
    });

    t.test("Should throw invalid score on gauge > 100.", (t) => {
        t.rejects(
            ConverterIRFervidex(
                // @ts-expect-error eternally broken deepmerge
                deepmerge(baseFervidexScore, { gauge: [150] }),
                { version: "27" },
                "ir/fervidex",
                logger
            ),
            { message: /Invalid value of gauge 150/giu } as any
        );

        t.end();
    });

    t.test("Should convert undeflow gauge to null.", async (t) => {
        const res = await ConverterIRFervidex(
            deepmerge(baseFervidexScore, { gauge: [10, 5, 249, 248] }),
            { version: "27" },
            "ir/fervidex",
            logger
        );

        t.hasStrict(
            res,
            {
                song: Testing511Song,
                chart: Testing511SPA,
                dryScore: deepmerge(baseDryScore, {
                    scoreData: { hitMeta: { gauge: null, gaugeHistory: [10, 5, null, null] } },
                }),
            } as any, // broken
            "Should return a dry score."
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
