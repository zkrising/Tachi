import t from "tap";
import db from "../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import ResetDBState from "../../../../test-utils/reset-db-state";
import CreateLogCtx from "../../../logger/logger";
import { BatchManualContext, BatchManualScore } from "../../import-types/common/batch-manual/types";
import { OrphanScore, ReprocessOrphan } from "./orphans";
import fjsh from "fast-json-stable-hash";
import { OrphanScoreDocument } from "../../import-types/common/types";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

const batchManualScore: BatchManualScore = {
    score: 500,
    lamp: "HARD CLEAR",
    matchType: "songTitle",
    identifier: "5.1.1.",
    playtype: "SP",
    difficulty: "ANOTHER",
};

const batchManualContext: BatchManualContext = { game: "iidx", service: "foo", version: "27" };

t.test("#OrphanScore", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should orphan data and context information.", async (t) => {
        const res = await OrphanScore(
            "ir/direct-manual",
            1,
            batchManualScore,
            batchManualContext,
            "Example Error Message",
            logger
        );

        t.equal(res.success, true);
        t.equal(
            res.orphanID,
            `O${fjsh.hash(
                {
                    importType: "ir/direct-manual",
                    data: batchManualScore,
                    context: batchManualContext,
                    userID: 1,
                },
                "sha256"
            )}`,
            "Should be a checksum of the orphan's contents."
        );

        const dbCheck = await db["orphan-scores"].findOne({
            orphanID: res.orphanID,
        });

        t.hasStrict(dbCheck, {
            orphanID: res.orphanID,
            userID: 1,
            data: batchManualScore,
            context: batchManualContext,
            importType: "ir/direct-manual",
            errMsg: "Example Error Message",
        });

        t.ok(
            Math.abs(dbCheck!.timeInserted - Date.now()) < 10_000,
            "timeInserted should be decently close to now."
        );

        t.end();
    });

    t.test("Should skip orphans that already exist.", async (t) => {
        const res1 = await OrphanScore(
            "ir/direct-manual",
            1,
            batchManualScore,
            batchManualContext,
            "Example Error Message",
            logger
        );

        const res2 = await OrphanScore(
            "ir/direct-manual",
            1,
            batchManualScore,
            batchManualContext,
            "Example Error Message",
            logger
        );

        t.equal(res2.success, false);
        t.equal(res1.orphanID, res2.orphanID);

        const dbCheck = await db["orphan-scores"].count();

        t.equal(dbCheck, 1);
    });

    t.end();
});

t.test("#ReprocessOrphan", (t) => {
    t.beforeEach(ResetDBState);

    const orphanDoc: OrphanScoreDocument = {
        context: batchManualContext,
        data: batchManualScore,
        errMsg: "foo",
        importType: "ir/direct-manual",
        orphanID: "foo",
        timeInserted: 0,
        userID: 1,
    };

    t.test("Should convert and insert an orphan if parents are found", async (t) => {
        // this orphan doc is for 5.1.1. SPA, which definitely exists in
        // the test DB.
        const res = await ReprocessOrphan(orphanDoc, logger);

        t.hasStrict(
            res,
            {
                success: true,
                type: "ScoreImported",
                message: null,
                content: {
                    score: {
                        game: "iidx",
                        service: "foo (DIRECT-MANUAL)",
                        comment: null,
                        importType: "ir/direct-manual",
                        timeAchieved: null,
                        scoreMeta: {},
                        scoreData: {
                            lampIndex: 5,
                            gradeIndex: 1,
                            esd: 60.546875,
                            lamp: "HARD CLEAR",
                            score: 500,
                            grade: "E",
                            percent: 31.806615776081426,
                            hitData: {},
                            hitMeta: {},
                        },
                        highlight: false,
                        userID: 1,
                        calculatedData: {
                            ktRating: 0.6840944877852578,
                            ktLampRating: 10.6,
                            BPI: -15,
                            "K%": null,
                        },
                        songID: 1,
                        chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
                        scoreID:
                            "R7a3a2b04bd4882ec06c198d78297fe3d56561502c7b134c067214bbfdf4f1602",
                        playtype: "SP",
                        isPrimary: true,
                    },
                },
            },
            "Should successfully import the score."
        );

        const orphan = await db["orphan-scores"].findOne({ orphanID: orphanDoc.orphanID });

        t.equal(orphan, null, "Should remove the orphan document.");

        t.end();
    });

    t.test("Should delete the orphan doc and return null if the score is invalid.", async (t) => {
        await db["orphan-scores"].insert(orphanDoc);
        const res = await ReprocessOrphan(
            deepmerge(orphanDoc, {
                data: {
                    score: 99999,
                },
            }),
            logger
        );

        t.equal(res, null);

        const orphan = await db["orphan-scores"].findOne({ orphanID: orphanDoc.orphanID });

        t.equal(orphan, null, "Should remove the orphan document.");

        t.end();
    });

    t.test(
        "Should keep the orphan doc and return false if no parents could be found.",
        async (t) => {
            await db["orphan-scores"].insert(orphanDoc);
            const res = await ReprocessOrphan(
                deepmerge(orphanDoc, {
                    data: {
                        identifier: "NONSENSE CHART TITLE",
                    },
                }),
                logger
            );

            t.equal(res, false);

            const orphan = await db["orphan-scores"].findOne({ orphanID: orphanDoc.orphanID });

            t.not(orphan, null, "Should not remove the orphan document.");

            t.end();
        }
    );

    t.test(
        "Should keep the orphan doc and return false if an internal failure was triggered.",
        async (t) => {
            await db["orphan-scores"].insert(orphanDoc);
            const GAZER_SHA256 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";

            // force an internal failure by removing all bms songs and then
            // leaving a valid bms chart to match with.
            await db.songs.bms.remove({});

            const res = await ReprocessOrphan(
                deepmerge(orphanDoc, {
                    context: {
                        game: "bms",
                    },
                    data: {
                        matchType: "bmsChartHash",
                        identifier: GAZER_SHA256,
                    },
                }),
                logger
            );

            t.equal(res, false);

            const orphan = await db["orphan-scores"].findOne({ orphanID: orphanDoc.orphanID });

            t.not(orphan, null, "Should not remove the orphan document.");

            t.end();
        }
    );

    t.end();
});

t.teardown(CloseAllConnections);
