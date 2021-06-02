import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import { GetKTDataJSON } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ConvertAPIArcDDR } from "./converter";
import { ARCDDRScore } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

const arcScore = GetKTDataJSON("./api-arc/ddr-score.json") as ARCDDRScore;

t.test("#ConvertAPIArcDDR", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should convert a valid score", async (t) => {
        const res = await ConvertAPIArcDDR(arcScore, {}, "api/arc-ddr", logger);

        t.strictSame(res, {
            song: {},
            chart: {},
            dryScore: {},
        });

        t.end();
    });

    t.test("Should throw on an invalid score", (t) => {
        t.rejects(
            () =>
                ConvertAPIArcDDR(
                    deepmerge(arcScore, { ex_score: "foo" }),
                    {},
                    "api/arc-ddr",
                    logger
                ),
            {
                message: /Invalid ARC Score:/iu,
            } as any
        );

        t.end();
    });

    t.test("Should throw on no chart", (t) => {
        t.rejects(
            () =>
                ConvertAPIArcDDR(
                    deepmerge(arcScore, { chart_id: "foo" }),
                    {},
                    "api/arc-ddr",
                    logger
                ),
            {
                message: /Could not find chart/iu,
            } as any
        );

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
