import { ScoreDocument } from "kamaitachi-common";
import db from "../../../db";

let ScoreQueue: ScoreDocument[] = [];
const MAX_PIPELINE_LENGTH = 500;

/**
 * Adds a score to a queue to be inserted in batch to the database.
 * @param score - The score document to queue.
 */
export async function QueueScoreInsert(score: ScoreDocument) {
    ScoreQueue.push(score);

    if (ScoreQueue.length >= MAX_PIPELINE_LENGTH) {
        return await InsertQueue();
    }

    return null;
}

/**
 * Bulk inserts the entire Queue.
 * @warn Race condition?
 */
export async function InsertQueue() {
    const temp = ScoreQueue.splice(0);
    if (temp.length !== 0) {
        await db.scores.insert(temp);
    }

    return temp.length;
}
