/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import CreateLogCtx from "../../../../logger";
import { Testing511Song, Testing511SPA } from "../../../../test-utils/test-data";
import { ResolveChartFromSong, ResolveMatchTypeToKTData, ConverterBatchManual } from "./converter";
import deepmerge from "deepmerge";
import { EscapeStringRegexp } from "../../../../common/util";
import { CloseMongoConnection } from "../../../../db/db";
import { Game } from "kamaitachi-common";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { InvalidScoreFailure } from "../../../framework/common/converter-failures";

const baseBatchManualScore = {
    score: 500,
    lamp: "HARD CLEAR" as const,
    matchType: "kamaitachiSongID" as const,
    identifier: "1",
    playtype: "SP" as const,
    difficulty: "ANOTHER",
};

const context = {
    game: "iidx" as const,
    service: "foo",
    version: null,
};

const ktdWrap = (msg: string, game: Game = "iidx", version = null): any => ({
    importType: "file/batch-manual",
    message: new RegExp(EscapeStringRegexp(msg), "u"),
    converterContext: { game, service: "foo", version },
    data: {}, // any under t.match rules.
});

const logger = CreateLogCtx("converter.test.ts");

const importType = "file/batch-manual" as const;

t.test("#ResolveMatchTypeToKTData", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should resolve for the songID if the matchType is songID", async (t) => {
        const res = await ResolveMatchTypeToKTData(
            baseBatchManualScore,
            context,
            importType,
            logger
        );

        t.hasStrict(
            res,
            { song: { id: 1 }, chart: Testing511SPA } as any,
            "Should return the right song and chart."
        );

        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    // @ts-expect-error bad
                    deepmerge(baseBatchManualScore, { identifier: "90000" }),
                    context,
                    importType,
                    logger
                ),
            ktdWrap("Cannot find song with songID 90000")
        );

        t.end();
    });

    t.test("Should resolve for the song title if the matchType is songTitle", async (t) => {
        const res = await ResolveMatchTypeToKTData(
            deepmerge(baseBatchManualScore, { matchType: "songTitle", identifier: "5.1.1." }),
            context,
            importType,
            logger
        );

        t.hasStrict(
            res,
            { song: { id: 1 }, chart: Testing511SPA } as any,
            "Should return the right song and chart."
        );

        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    deepmerge(baseBatchManualScore, {
                        matchType: "songTitle",
                        identifier: "INVALID_TITLE",
                    }),
                    context,
                    importType,
                    logger
                ),
            ktdWrap("Cannot find song with title INVALID_TITLE")
        );

        t.end();
    });

    t.skip("Should resolve for the bms chartHash if the matchType is bmsChartHash", async (t) => {
        const GAZER17MD5 = "38616b85332037cc12924f2ae2840262";
        const GAZER17SHA256 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";

        const resMD5 = await ResolveMatchTypeToKTData(
            deepmerge(baseBatchManualScore, { matchType: "bmsChartHash", identifier: GAZER17MD5 }),
            context,
            importType,
            logger
        );

        t.hasStrict(
            resMD5,
            // @todo add gazer's details here
            { song: { id: 1 }, chart: {} } as any,
            "Should return the right song and chart."
        );

        const resSHA256 = await ResolveMatchTypeToKTData(
            deepmerge(baseBatchManualScore, {
                matchType: "bmsChartHash",
                identifier: GAZER17SHA256,
            }),
            context,
            importType,
            logger
        );

        t.hasStrict(
            resSHA256,
            // @todo Add Gazer sp17 data here.
            { song: { id: 1 }, chart: {} } as any,
            "Should return the right song and chart."
        );

        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    deepmerge(baseBatchManualScore, {
                        matchType: "bmsChartHash",
                        identifier: "bad_hash",
                    }),
                    context,
                    importType,
                    logger
                ),
            ktdWrap("Cannot find chart with hash ", "bms")
        );

        t.end();
    });

    t.test("Should reject if ddrSongHash is called without game = ddr", async (t) => {
        t.rejects(
            ResolveMatchTypeToKTData(
                deepmerge(baseBatchManualScore, {
                    matchType: "ddrSongHash",
                    playtype: "SP",
                    difficulty: "DIFFICULT",
                }),
                context,
                importType,
                logger
            ),
            new InvalidScoreFailure("Cannot use ddrSongHash lookup on iidx.") as any
        );
    });

    t.test("Should resolve for the ddr songHash if the matchType is ddrSongHash", async (t) => {
        const PUTY_ID = "DQlQ1DlPbq900oqdOo8l0d6I1lIOl99l";

        const res = await ResolveMatchTypeToKTData(
            deepmerge(baseBatchManualScore, {
                matchType: "ddrSongHash",
                identifier: PUTY_ID,
                playtype: "SP",
                difficulty: "DIFFICULT",
            }),
            deepmerge(context, { game: "ddr" }),
            importType,
            logger
        );

        t.hasStrict(
            res,
            // @todo add puty's details here
            {
                song: { id: 10 },
                chart: { chartID: "48024d36bbe76c9fed09c3ffdc19412925d1efd3" },
            } as any,
            "Should return the right song and chart."
        );

        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    deepmerge(baseBatchManualScore, {
                        matchType: "ddrSongHash",
                        identifier: "Bad_ID",
                        playtype: "SP",
                        difficulty: "EXPERT",
                    }),
                    deepmerge(context, { game: "ddr" }),
                    importType,
                    logger
                ),
            ktdWrap("Cannot find chart for songHash", "ddr")
        );

        t.end();
    });

    t.test("Should trigger failsave if invalid matchType is provided.", (t) => {
        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    deepmerge(baseBatchManualScore, {
                        matchType: "BAD_MATCHTYPE",
                    }),
                    context,
                    importType,
                    logger
                ),
            new InvalidScoreFailure(`Invalid matchType BAD_MATCHTYPE`) as any
        );

        t.end();
    });

    t.end();
});

t.test("#ResolveChartFromSong", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return the chart for the song + ptdf", async (t) => {
        const res = await ResolveChartFromSong(
            Testing511Song,
            baseBatchManualScore, // has playtype + diff
            { game: "iidx", service: "foo", version: null },
            importType
        );

        t.hasStrict(res, Testing511SPA as any);

        t.end();
    });

    t.test("Should throw an error if no playtype is provided.", (t) => {
        t.rejects(
            () =>
                ResolveChartFromSong(
                    Testing511Song,
                    deepmerge(baseBatchManualScore, { playtype: null }),
                    { game: "iidx", service: "foo", version: null },
                    importType
                ),
            new InvalidScoreFailure(
                `Missing 'playtype' field, but was necessary for this lookup.`
            ) as any
        );

        t.end();
    });

    t.test("Should throw an error if no difficulty is provided.", (t) => {
        t.rejects(
            () =>
                ResolveChartFromSong(
                    Testing511Song,
                    deepmerge(baseBatchManualScore, { difficulty: null }),
                    { game: "iidx", service: "foo", version: null },
                    importType
                ),
            new InvalidScoreFailure(
                `Missing 'difficulty' field, but was necessary for this lookup.`
            ) as any
        );

        t.end();
    });

    t.test("Should throw an error if an invalid difficulty is provided.", (t) => {
        t.rejects(
            () =>
                ResolveChartFromSong(
                    Testing511Song,
                    // @ts-expect-error faulty deepmerge types
                    deepmerge(baseBatchManualScore, { difficulty: "NOT_VALID_DIFFICULTY" }),
                    { game: "iidx", service: "foo", version: null },
                    importType
                ),
            new InvalidScoreFailure(
                `Invalid Difficulty for iidx SP - Expected any of BEGINNER, NORMAL, HYPER, ANOTHER, LEGGENDARIA`
            ) as any
        );

        t.end();
    });

    t.test("Should throw an error if no chart could be found.", (t) => {
        t.rejects(
            () =>
                ResolveChartFromSong(
                    Testing511Song,
                    // @ts-expect-error faulty deepmerge types
                    deepmerge(baseBatchManualScore, { difficulty: "LEGGENDARIA" }), // 511 has no legg (yet, lol)
                    { game: "iidx", service: "foo", version: null },
                    importType
                ),
            ktdWrap("Cannot find chart for 5.1.1. (SP LEGGENDARIA)")
        );

        t.end();
    });

    t.test("Should successfully lookup if version is provided.", async (t) => {
        const res = await ResolveChartFromSong(
            Testing511Song,
            baseBatchManualScore,
            {
                game: "iidx",
                service: "foo",
                version: "27",
            },
            importType
        );

        t.hasStrict(res, Testing511SPA as any);

        t.end();
    });

    t.end();
});

t.test("#ConverterFn", (t) => {
    t.test("Should produce a DryScore", async (t) => {
        const res = await ConverterBatchManual(
            baseBatchManualScore,
            { game: "iidx", service: "foo", version: null },
            importType,
            logger
        );

        t.hasStrict(res, {
            chart: Testing511SPA,
            song: { id: 1 },
            dryScore: {
                game: "iidx",
                service: "foo (BATCH-MANUAL)",
                comment: null,
                importType: "file/batch-manual",
                timeAchieved: null,
                scoreData: {
                    lamp: "HARD CLEAR",
                    score: 500,
                    grade: "E",
                    // percent: 31.5, -- ish, FPA is hard.
                    hitData: {},
                    hitMeta: {},
                },
                scoreMeta: {},
            },
        } as any);

        t.end();
    });

    t.test("Should reject a score with > 100%", (t) => {
        t.rejects(
            () =>
                ConverterBatchManual(
                    // @ts-expect-error broken deepmerge
                    deepmerge(baseBatchManualScore, { score: 2000 }),
                    { game: "iidx", service: "foo", version: null },
                    importType,
                    logger
                ),
            { message: /Invalid score of 2000, produced percent of 127/u } as any
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
