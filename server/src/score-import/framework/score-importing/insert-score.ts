import { ScoreDocument } from "kamaitachi-common";
import db from "../../../external/mongo/db";
import CreateLogCtx from "../../../common/logger";

const logger = CreateLogCtx(__filename);
const ScoreQueue: ScoreDocument[] = [];
export let ScoreIDs: Set<string> = new Set();
const MAX_PIPELINE_LENGTH = 500;

/**
 * Adds a score to a queue to be inserted in batch to the database.
 * @param score - The score document to queue.
 * @returns True on success, The amount of scores inserted on auto-pipeline-flush, and null if
 * the score provided is already loaded.
 */
export function QueueScoreInsert(score: ScoreDocument) {
    if (ScoreIDs.has(score.scoreID)) {
        // skip
        logger.verbose(`Triggered skip for ID ${score.scoreID}`);
        return null;
    }

    ScoreQueue.push(score);
    ScoreIDs.add(score.scoreID);

    if (ScoreQueue.length >= MAX_PIPELINE_LENGTH) {
        logger.verbose(`Triggered pipeline flush with len ${ScoreQueue.length}.`);
        return InsertQueue();
    }

    return true;
}

/**
 * Bulk inserts the entire Queue.
 * @warn Be cautious of inducing race conditions when using this function.
 */
export async function InsertQueue() {
    const temp = ScoreQueue.splice(0);
    if (temp.length !== 0) {
        ScoreIDs = new Set();
        try {
            await db.scores.insert(temp);
        } catch (err) {
            logger.warn(
                `Triggered duplicate key protection. Race condition protected against, but this is not good.`
            );
            return null;
        }
    }

    return temp.length;
}
