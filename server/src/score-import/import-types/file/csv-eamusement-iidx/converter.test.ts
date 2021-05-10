import t from "tap";
import db, { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import ResetDBState from "../../../../test-utils/reset-db-state";
import ConverterFn, { EamScoreConverter, EamScoreConverterWrapper } from "./converter";
import p from "prudence";
import { prAssert } from "../../../../test-utils/asserts";
import deepmerge from "deepmerge";
import { EamusementScoreData } from "./types";
import {
    ConverterFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../framework/score-importing/converter-failures";

const logger = CreateLogCtx("converter.test.ts");

const chartID511 = "c2311194e3897ddb5745b1760d2c0141f933e683";

const DryScorePrudence = {
    service: p.equalTo("e-amusement"),
    game: p.equalTo("iidx"),
    comment: "null",
    importType: p.equalTo("file/csv:eamusement-iidx"),
    timeAchieved: p.equalTo(Date.parse("Tue, 27 Apr 2021 21:35:35 GMT")),
    scoreMeta: {},
    scoreData: {
        grade: p.equalTo("F"),
        lamp: p.equalTo("HARD CLEAR"),
        score: p.equalTo(192),
        esd: p.equalTo(162.5),
        percent: p.aprx(12.21),
        hitData: {
            pgreat: p.equalTo(75),
            great: p.equalTo(42),
        },
        hitMeta: {
            bp: p.equalTo(12),
        },
    },
};

const valid511Score = {
    bp: "12",
    difficulty: "ANOTHER" as const, // lol
    exscore: "192",
    great: "42",
    pgreat: "75",
    lamp: "HARD CLEAR",
    level: "10",
};

const converterContext = {
    playtype: "SP" as const,
    hasBeginnerAndLegg: false,
    importVersion: "27",
    serviceOrigin: "e-amusement",
};

const data = {
    scores: [valid511Score],
    timestamp: "Tue, 27 Apr 2021 21:35:35 GMT",
    title: "5.1.1",
};

// Testing floats with strictSame under tap is a pain because it uses ===
// and there is no way around it. We have isApproximately for this purpose
// But it'd be easier if we could just .toFixed() the percent and compare it as
// a string.

t.test("#EamScoreConverter", async (t) => {
    t.beforeEach(ResetDBState);

    // this returns 511
    let song = await db.songs.iidx.findOne();

    function EamScoreConverterAuto(score: Partial<EamusementScoreData> = {}) {
        return EamScoreConverter(
            deepmerge(valid511Score, score) as EamusementScoreData,
            song!,
            converterContext,
            data,
            false,
            logger
        );
    }

    t.test("Valid Scores", (t) => {
        t.test("Normal 511 SPA Score", async (t) => {
            let res = await EamScoreConverterAuto();

            t.not(res, null, "Should not be null.");

            t.equal(
                res!.ktchiChart.chartID,
                chartID511,
                "Should have selected 511 SPA as the chart."
            );

            prAssert(res!.dryScore, DryScorePrudence, "Should return the expected dryscore.");

            t.end();
        });

        t.test("--- BP Score", async (t) => {
            let res = await EamScoreConverterAuto({ bp: "---" });

            t.not(res, null, "Should not be null.");

            t.equal(
                res!.ktchiChart.chartID,
                chartID511,
                "Should have selected 511 SPA as the chart."
            );

            prAssert(
                res!.dryScore,
                deepmerge(DryScorePrudence, { scoreData: { hitMeta: { bp: "undefined" } } }),
                "Should return the expected dryscore."
            );

            t.end();
        });

        t.test("Nonsense String BP Score", async (t) => {
            let res = await EamScoreConverterAuto({ bp: "ASDF" });

            t.not(res, null, "Should not be null.");

            t.equal(
                res!.ktchiChart.chartID,
                chartID511,
                "Should have selected 511 SPA as the chart."
            );

            prAssert(
                res!.dryScore,
                deepmerge(DryScorePrudence, { scoreData: { hitMeta: { bp: "undefined" } } }),
                "Should return the expected dryscore."
            );

            t.end();
        });

        t.test("0 EX Score", async (t) => {
            let res = await EamScoreConverterAuto({ exscore: "0", pgreat: "0", great: "0" });

            t.equal(res, null, "Should be null.");

            t.end();
        });

        t.test("1 EX Score", async (t) => {
            let res = await EamScoreConverterAuto({ exscore: "1", pgreat: "0", great: "1" });

            t.not(res, null, "Should not be null.");

            t.equal(
                res!.ktchiChart.chartID,
                chartID511,
                "Should have selected 511 SPA as the chart."
            );

            prAssert(
                res!.dryScore,
                deepmerge(DryScorePrudence, {
                    scoreData: {
                        score: p.equalTo(1),
                        percent: p.aprx(0.063),
                        esd: p.equalTo(200),
                        hitData: {
                            pgreat: p.equalTo(0),
                            great: p.equalTo(1),
                        },
                    },
                }),
                "Should return the expected dryscore."
            );

            t.end();
        });

        t.test("Level 0 chart", async (t) => {
            let res = await EamScoreConverterAuto({ level: "0" });

            t.equal(res, null, "Should be null.");

            t.end();
        });

        t.end();
    });

    t.test("Invalid Scores", (t) => {
        t.test("Chart that doesn't exist", (t) => {
            EamScoreConverterAuto({ difficulty: "LEGGENDARIA" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new KTDataNotFoundFailure(
                            `Could not find chart for 5.1.1. (SP LEGGENDARIA [v27])`,
                            "file/csv:eamusement-iidx",
                            data,
                            converterContext
                        ),
                        "Should return a KTDataNotFoundFailure"
                    );

                    t.end();
                });
        });

        t.test("Invalid PGreat/Great count", (t) => {
            EamScoreConverterAuto({ exscore: "100", pgreat: "20", great: "5" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(
                            `5.1.1. (SP ANOTHER [v27]) - PGreats * 2 + Greats did not equal EXScore (20 * 2 + 5 != 100).`
                        ),
                        "Should return an InvalidScoreFailure"
                    );

                    t.end();
                });
        });

        t.test(">100%", (t) => {
            EamScoreConverterAuto({ exscore: "9999" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(
                            `5.1.1. (SP ANOTHER [v27]) - Invalid EX Score of 9999 (Was greater than max chart ex of 1572).`
                        ),
                        "Should return an InvalidScoreFailure"
                    );

                    t.end();
                });
        });

        t.test("Nonsense Lamp", (t) => {
            EamScoreConverterAuto({ lamp: "invalid" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(
                            `5.1.1. (SP ANOTHER [v27]) - Invalid Lamp of invalid.`
                        ),
                        "Should return an InvalidScoreFailure"
                    );

                    t.end();
                });
        });

        t.test("Invalid BP", async (t) => {
            await EamScoreConverterAuto({ bp: "5.73" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(`5.1.1. (SP ANOTHER [v27]) - Invalid BP of 5.73.`),
                        "Should return an InvalidScoreFailure"
                    );
                });

            await EamScoreConverterAuto({ bp: "-5.73" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(`5.1.1. (SP ANOTHER [v27]) - Invalid BP of -5.73.`),
                        "Should return an InvalidScoreFailure"
                    );
                });

            await EamScoreConverterAuto({ bp: "-1" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(`5.1.1. (SP ANOTHER [v27]) - Invalid BP of -1.`),
                        "Should return an InvalidScoreFailure"
                    );
                });

            await EamScoreConverterAuto({ bp: "10000" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(`5.1.1. (SP ANOTHER [v27]) - Invalid BP of 10000.`),
                        "Should return an InvalidScoreFailure"
                    );
                });

            await EamScoreConverterAuto({ bp: "-10000" })
                .then(() => t.fail())
                .catch((err) => {
                    t.strictSame(
                        err,
                        new InvalidScoreFailure(
                            `5.1.1. (SP ANOTHER [v27]) - Invalid BP of -10000.`
                        ),
                        "Should return an InvalidScoreFailure"
                    );
                });

            t.end();
        });

        t.end();
    });

    t.end();
});

t.test("#EamScoreConverterWrapper", async (t) => {
    t.beforeEach(ResetDBState);

    const song = await db.songs.iidx.findOne();

    // wrapper wrapper, lol
    function EamScoreConverterWrapperAuto(score: Partial<EamusementScoreData> = {}) {
        return EamScoreConverterWrapper(
            deepmerge(valid511Score, score) as EamusementScoreData,
            song!,
            converterContext,
            data,
            false,
            logger
        );
    }

    t.test("Should convert thrown errors into returns", async (t) => {
        let res = await EamScoreConverterWrapperAuto({ exscore: "-1" });

        t.strictSame(
            res,
            new InvalidScoreFailure(
                "5.1.1. (SP ANOTHER [v27]) - Invalid EX score of -1 (Was negative.)"
            )
        );

        t.end();
    });

    t.test("Should return EamScoreConverter on success", async (t) => {
        let res = await EamScoreConverterWrapperAuto();

        if (res instanceof ConverterFailure || !res) {
            return t.fail("Unexpected ConverterFailure");
        }

        t.strictSame(res.song, song, "Should return the right song");
        t.equal(res.chart.chartID, chartID511, "Should return the right chart");

        prAssert(res.dryScore, DryScorePrudence, "Should return the right DryScore.");

        t.end();
    });

    t.end();
});

t.todo("#ConverterFn", async (t) => {
    t.beforeEach(ResetDBState);

    t.end();
});

t.teardown(CloseMongoConnection);
