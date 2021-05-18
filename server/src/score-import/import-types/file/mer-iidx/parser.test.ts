/* eslint-disable @typescript-eslint/no-explicit-any */
import t from "tap";
import { CloseMongoConnection } from "../../../../db/db";
import CreateLogCtx from "../../../../logger";
import { MockMulterFile } from "../../../../test-utils/mock-multer";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataBuffer } from "../../../../test-utils/test-data";
import { ParseMerIIDX } from "./parser";

const logger = CreateLogCtx("parser.test.ts");

t.test("#ParseMerIIDX", (t) => {
    t.beforeEach(ResetDBState);

    function mrfb(buffer: Buffer) {
        return ParseMerIIDX(MockMulterFile(buffer, "buffer.json"), {}, logger);
    }

    function mrff(filename: string) {
        return ParseMerIIDX(MockMulterFile(GetKTDataBuffer(filename), filename), {}, logger);
    }

    // @todo Better tests for invalidating bad input?

    t.test("Basic Parsing", (t) => {
        const res = mrff("./mer/base.json");

        t.hasStrict(
            res,
            {
                game: "iidx",
                context: {},
                classHandler: null,
                iterable: [
                    {
                        music_id: 3007,
                        music_name: "Presto",
                        play_type: "SINGLE",
                        diff_type: "HYPER",
                        score: 566,
                        miss_count: 46,
                        clear_type: "NO PLAY",
                        update_time: "2019-06-01 19:56:59",
                    },
                    {
                        music_id: 3013,
                        music_name: "THE SAFARI",
                        play_type: "SINGLE",
                        diff_type: "NORMAL",
                        score: 681,
                        miss_count: 102,
                        clear_type: "FAILED",
                        update_time: "2019-05-30 03:21:57",
                    },
                    {
                        music_id: 3213,
                        music_name: "TAKE ON ME",
                        play_type: "SINGLE",
                        diff_type: "ANOTHER",
                        score: 922,
                        miss_count: 56,
                        clear_type: "CLEAR",
                        update_time: "2019-05-03 02:10:58",
                    },
                ],
            } as any,
            "Should correctly parse data."
        );

        t.end();
    });

    t.test("Should throw on invalid JSON", (t) => {
        t.throws(() => mrfb(Buffer.from("{]")));

        t.end();
    });

    t.test("Should throw on non-top-level-array", (t) => {
        t.throws(() => mrfb(Buffer.from("{}")));

        t.end();
    });

    t.test("Should throw on invalid Mer Scores", (t) => {
        t.throws(() => mrfb(Buffer.from(JSON.stringify([{ foo: "bar" }]))));

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
