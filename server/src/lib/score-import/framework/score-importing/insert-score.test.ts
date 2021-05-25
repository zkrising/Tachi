import { ScoreDocument } from "kamaitachi-common";
import t from "tap";
import db, { CloseMongoConnection } from "../../../../external/mongo/db";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { InsertQueue, QueueScoreInsert } from "./insert-score";

// these two get the same tests, because they're too closely linked
t.test("#QueueScoreInsert, #InsertQueue", async (t) => {
    t.beforeEach(ResetDBState);

    // empty scoreDB after
    t.afterEach(async () => {
        await db.scores.remove({});
    });

    t.test("Single Queue Test", async (t) => {
        // fake score doc
        const res = await QueueScoreInsert(({ scoreID: "foo" } as unknown) as ScoreDocument);

        t.equal(
            res,
            true,
            "QueueScoreInsert should not insert a score when the queue is not full."
        );

        // this is the best way to get the size of the queue
        const flushSize = await InsertQueue();

        t.equal(flushSize, 1, "QueueScoreInsert should append the score to the queue.");

        const dbRes = await db.scores.find({
            scoreID: "foo",
        });

        t.equal(
            dbRes.length,
            1,
            "InsertQueue should insert all 1 members of the queue into the database."
        );

        t.end();
    });

    let r = await InsertQueue(); // flush queue just incase former test fails.

    t.equal(r, 0, "Queue should be empty after test.");

    t.test("Queue Overflow Test", async (t) => {
        for (let i = 0; i < 499; i++) {
            // eslint-disable-next-line no-await-in-loop
            await QueueScoreInsert(({ scoreID: i, chartID: "test" } as unknown) as ScoreDocument);
        }

        const overflowRes = await QueueScoreInsert(({
            scoreID: "foo",
            chartID: "test",
        } as unknown) as ScoreDocument);

        t.equal(
            overflowRes,
            500,
            "Appending 500 items to the queue should result in them being inserted."
        );

        const flushRes = await InsertQueue();

        t.equal(flushRes, 0, "The queue should now be empty.");

        const dbRes = await db.scores.find({
            scoreID: { $exists: true },
            chartID: "test",
        });

        t.equal(
            dbRes.length,
            500,
            "InsertQueue should insert all 500 members of the queue into the database."
        );

        t.end();
    });

    r = await InsertQueue(); // flush queue just incase former test fails.

    t.equal(r, 0, "Queue should be empty after test.");

    t.test("Queue Dedupe Test", async (t) => {
        await QueueScoreInsert(({ scoreID: 1, chartID: "foo" } as unknown) as ScoreDocument);
        const r2 = await QueueScoreInsert(({
            scoreID: 1,
            chartID: "foo",
        } as unknown) as ScoreDocument);

        t.equal(r2, null, "Should return null when a duplicate scoreID is submitted");

        const flushRes = await InsertQueue();

        t.equal(flushRes, 1, "Should flush 1 score document");

        const dbRes = await db.scores.find({
            chartID: "foo",
        });

        t.equal(dbRes.length, 1, "Should only insert one document");
    });

    t.end();
});

t.teardown(CloseMongoConnection);
