import { ScoreDocument, integer } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { InternalFailure } from "../common/converter-failures";

const logger = CreateLogCtx(__filename);
const MAX_PIPELINE_LENGTH = 500;

interface ScoreQueue {
	queue: ScoreDocument[];
	scoreIDSet: Set<string>;
}

const ScoreQueues: Record<integer, ScoreQueue> = {};

/**
 * Returns this user's score queue. A score queue is a temporary place scores are saved
 * so that they can be inserted into the database in bulk.
 *
 * This massively improves performance on large imports instead of constantly running single imports.
 *
 * If a score queue does not exist for the user, one is created.
 */
function GetScoreQueue(userID: integer) {
	const queue = ScoreQueues[userID];

	if (!queue) {
		logger.debug(`Creating new ScoreQueue for user ${userID}.`);
		ScoreQueues[userID] = {
			queue: [],
			scoreIDSet: new Set(),
		};
	}

	return queue;
}

/**
 * Adds a new score to the given queue.
 */
function AddToScoreQueue(scoreQueue: ScoreQueue, score: ScoreDocument) {
	scoreQueue.queue.push(score);
	scoreQueue.scoreIDSet.add(score.scoreID);
}

async function InsertQueue(scoreQueue: ScoreQueue, userID: integer) {
	const queuedScores = scoreQueue.queue.splice(0);

	if (queuedScores.length !== 0) {
		delete ScoreQueues[userID];

		try {
			await db.scores.insert(queuedScores);
		} catch (err) {
			logger.warn(
				`Triggered duplicate key protection. Race condition protected against, but this is not good.`
			);
			return null;
		}
	}

	return queuedScores.length;
}

/**
 * Adds a score to a queue to be inserted in batch to the database.
 * @param score - The score document to queue.
 * @returns True on success, The amount of scores inserted on auto-pipeline-flush, and null if
 * the score provided is already loaded.
 */
export function QueueScoreInsert(score: ScoreDocument) {
	const scoreQueue = GetScoreQueue(score.userID);

	if (scoreQueue.scoreIDSet.has(score.scoreID)) {
		// skip
		logger.verbose(`Score ID ${score.scoreID} was already queued to be imported.`);
		return null;
	}

	AddToScoreQueue(scoreQueue, score);

	if (scoreQueue.queue.length >= MAX_PIPELINE_LENGTH) {
		logger.verbose(`Triggered pipeline flush with len ${scoreQueue.queue.length}.`);
		return InsertQueue(scoreQueue, score.userID);
	}

	return true;
}
