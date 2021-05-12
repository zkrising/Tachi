import t from "tap";
import CreateLogCtx from "../../../../logger";
import { Testing511SPA } from "../../../../test-utils/test-data";
import ConverterFn, { ResolveChartFromSong, ResolveMatchTypeToKTData } from "./converter";
import deepmerge from "deepmerge";
import { KTDataNotFoundFailure } from "../../../framework/score-importing/converter-failures";
import escapeStringRegexp from "../../../../core/escape-string-regexp";
import { BatchManualScore } from "./types";
import { CloseMongoConnection } from "../../../../db/db";

const baseBatchManualScore = {
    score: 1000,
    lamp: "HARD CLEAR" as const,
    matchType: "songID" as const,
    identifier: "1",
    playtype: "SP" as const,
    difficulty: "ANOTHER",
};

const context = {
    game: "iidx" as const,
    service: "foo",
    version: null,
};

const ktdWrap = (msg: string, game = "iidx", version = null): any => ({
    importType: "file/json:batch-manual",
    message: new RegExp(escapeStringRegexp(msg), "u"),
    converterContext: { game, service: "foo", version },
    data: {}, // any under t.match rules.
});

const logger = CreateLogCtx("converter.test.ts");

t.test("#ResolveMatchTypeToKTData", (t) => {
    t.test("Should resolve for the songID if the matchType is songID", async (t) => {
        let res = await ResolveMatchTypeToKTData(baseBatchManualScore, context, logger);

        t.hasStrict(
            res,
            { song: { a: 1 }, chart: Testing511SPA } as any,
            "Should return the right song and chart."
        );

        t.rejects(
            () =>
                ResolveMatchTypeToKTData(
                    // @ts-expect-error bad
                    deepmerge(baseBatchManualScore, { identifier: "90000" }),
                    context,
                    logger
                ),
            ktdWrap("Cannot find song with songID 90000")
        );

        t.end();
    });

    t.end();
});

t.todo("#ResolveChartFromSong", (t) => {
    t.end();
});

t.todo("#ConverterFn", (t) => {
    t.end();
});

t.teardown(CloseMongoConnection);
