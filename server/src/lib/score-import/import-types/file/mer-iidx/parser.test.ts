import t from "tap";
import CreateLogCtx from "../../../../logger/logger";
import { MockMulterFile } from "../../../../../test-utils/mock-multer";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import { GetKTDataBuffer, GetKTDataJSON } from "../../../../../test-utils/test-data";
import { ParseMerIIDX } from "./parser";
import deepmerge from "deepmerge";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";

const logger = CreateLogCtx(__filename);

t.test("#ParseMerIIDX", (t) => {
    t.beforeEach(ResetDBState);

    function mrfb(buffer: Buffer) {
        return ParseMerIIDX(MockMulterFile(buffer, "buffer.json"), {}, logger);
    }

    function mrfj(obj: any) {
        return ParseMerIIDX(
            MockMulterFile(Buffer.from(JSON.stringify(obj)), "buffer.json"),
            {},
            logger
        );
    }

    function mrff(filename: string) {
        return ParseMerIIDX(MockMulterFile(GetKTDataBuffer(filename), filename), {}, logger);
    }

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
            },
            "Should correctly parse data."
        );

        t.end();
    });

    const baseScore = GetKTDataJSON("./mer/base.json");

    t.test("Should throw on invalid play_type", (t) => {
        t.throws(() => mrfj(deepmerge(baseScore, { play_type: "INVALID" })));
        t.throws(() => mrfj(deepmerge(baseScore, { play_type: null })));
        t.throws(() => mrfj(deepmerge(baseScore, { play_type: undefined })));
        t.throws(() => mrfj(deepmerge(baseScore, { play_type: 1 })));

        t.end();
    });

    t.test("Should throw on invalid score", (t) => {
        t.throws(() => mrfj(deepmerge(baseScore, { score: -1 })));
        t.throws(() => mrfj(deepmerge(baseScore, { score: 1.5 })));
        t.throws(() => mrfj(deepmerge(baseScore, { score: "1" })));
        t.throws(() => mrfj(deepmerge(baseScore, { score: null })));
        t.throws(() => mrfj(deepmerge(baseScore, { score: undefined })));

        t.end();
    });

    t.test("Should throw on invalid diff_type", (t) => {
        t.throws(() => mrfj(deepmerge(baseScore, { diff_type: "INVALID" })));
        t.throws(() => mrfj(deepmerge(baseScore, { diff_type: null })));
        t.throws(() => mrfj(deepmerge(baseScore, { diff_type: undefined })));

        t.end();
    });

    t.test("Should throw on invalid clear_type", (t) => {
        t.throws(() => mrfj(deepmerge(baseScore, { clear_type: "INVALID" })));
        t.throws(() => mrfj(deepmerge(baseScore, { clear_type: null })));
        t.throws(() => mrfj(deepmerge(baseScore, { clear_type: undefined })));

        t.end();
    });

    t.test("Should throw on invalid miss_count", (t) => {
        t.throws(() => mrfj(deepmerge(baseScore, { miss_count: "INVALID" })));
        t.throws(() => mrfj(deepmerge(baseScore, { miss_count: null })));
        t.throws(() => mrfj(deepmerge(baseScore, { miss_count: undefined })));

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

t.teardown(CloseAllConnections);
