import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import { GetKTDataJSON } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ConvertAPIArcDDR, ResolveARCDDRLamp } from "./converter";
import { ARCDDRScore } from "./types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

const arcScore = GetKTDataJSON("./api-arc/ddr-score.json") as ARCDDRScore;
const putySong = GetKTDataJSON("./kamaitachi/ddr-puty-song.json") as ARCDDRScore;
const putyChart = GetKTDataJSON("./kamaitachi/ddr-puty-chart.json") as ARCDDRScore;

t.test("#ConvertAPIArcDDR", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should convert a valid score", async (t) => {
        const res = await ConvertAPIArcDDR(arcScore, {}, "api/arc-ddr", logger);

        t.hasStrict(res, {
            song: putySong,
            chart: putyChart,
            dryScore: {
                comment: null,
                game: "ddr",
                importType: "api/arc-ddr",
                timeAchieved: 1591822550346,
                service: "ARC DDR Ace",
                scoreData: {
                    grade: "AAA",
                    percent: 99.976,
                    score: 807,
                    hitData: {
                        marvelous: 236,
                        perfect: 24,
                        great: 0,
                        good: 0,
                        boo: 0,
                        miss: 0,
                        ok: 17,
                        ng: 0,
                    },
                    hitMeta: {
                        fast: 10,
                        slow: 14,
                        maxCombo: 260,
                        exScore: 807,
                    },
                    lamp: "PERFECT FULL COMBO",
                },
                scoreMeta: {},
            },
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

t.test("#ResolveARCDDRLamp", (t) => {
    t.equal(ResolveARCDDRLamp("FAIL"), "FAILED");
    t.equal(ResolveARCDDRLamp("CLEAR"), "CLEAR");
    t.equal(ResolveARCDDRLamp("CLEAR_3LIFE"), "LIFE4");
    t.equal(ResolveARCDDRLamp("GOOD_FC"), "FULL COMBO");
    t.equal(ResolveARCDDRLamp("GREAT_FC"), "GREAT FULL COMBO");
    t.equal(ResolveARCDDRLamp("PERFECT_FC"), "PERFECT FULL COMBO");
    t.equal(ResolveARCDDRLamp("MARVELOUS_FC"), "MARVELOUS FULL COMBO");

    t.end();
});

t.teardown(CloseAllConnections);
