import { ScoreDocument } from "tachi-common";
import t from "tap";
import db from "external/mongo/db";

import ResetDBState from "test-utils/resets";
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
		const res = await QueueScoreInsert({
			scoreID: "foo",
			userID: 1,
		} as unknown as ScoreDocument);

		t.equal(
			res,
			true,
			"QueueScoreInsert should not insert a score when the queue is not full."
		);

		// this is the best way to get the size of the queue
		const flushSize = await InsertQueue(1);

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

	let r = await InsertQueue(1); // flush queue just incase former test fails.

	t.test("Queue Overflow Test", async (t) => {
		for (let i = 0; i < 499; i++) {
			// eslint-disable-next-line no-await-in-loop
			await QueueScoreInsert({
				scoreID: i,
				chartID: "test",
				userID: 1,
			} as unknown as ScoreDocument);
		}

		const overflowRes = await QueueScoreInsert({
			scoreID: "foo",
			chartID: "test",
			userID: 1,
		} as unknown as ScoreDocument);

		t.equal(
			overflowRes,
			500,
			"Appending 500 items to the queue should result in them being inserted."
		);

		const flushRes = await InsertQueue(1);

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

	r = await InsertQueue(1); // flush queue just incase former test fails.

	t.equal(r, 0, "Queue should be empty after test.");

	t.test("Queue Dedupe Test", async (t) => {
		await QueueScoreInsert({
			scoreID: 1,
			chartID: "foo",
			userID: 1,
		} as unknown as ScoreDocument);
		const r2 = await QueueScoreInsert({
			scoreID: 1,
			chartID: "foo",
			userID: 1,
		} as unknown as ScoreDocument);

		t.equal(r2, null, "Should return null when a duplicate scoreID is submitted");

		const flushRes = await InsertQueue(1);

		t.equal(flushRes, 1, "Should flush 1 score document");

		const dbRes = await db.scores.find({
			chartID: "foo",
		});

		t.equal(dbRes.length, 1, "Should only insert one document");
	});

	t.test("Should give separate users separate queues.", async (t) => {
		await QueueScoreInsert({
			scoreID: "1",
			chartID: "foo",
			userID: 1,
		} as unknown as ScoreDocument);
		await QueueScoreInsert({
			scoreID: "2",
			chartID: "foo",
			userID: 2,
		} as unknown as ScoreDocument);

		const r1 = await InsertQueue(1);
		t.equal(r1, 1, "Queue for userID 1 should have length 1.");

		const r2 = await InsertQueue(2);
		t.equal(r2, 1, "Queue for userID 2 should also have length 1.");

		t.end();
	});

	t.test("Should not throw if InsertQueue is called on an empty queue.", async (t) => {
		try {
			await InsertQueue(1);
			t.pass("Did not throw when inserting an empty queue.");
		} catch (err) {
			t.fail(err);
		}

		t.end();
	});

	t.end();
});
