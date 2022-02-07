import { Queue, QueueEvents } from "bullmq";
import CreateLogCtx from "lib/logger/logger";
import { Environment, TachiConfig } from "lib/setup/config";
import ScoreImportFatalError from "../framework/score-importing/score-import-error";

const ScoreImportQueue = new Queue(`${TachiConfig.NAME} Score Import Queue`, {
	connection: { host: Environment.redisUrl, port: 6379 },
});

export default ScoreImportQueue;

export const ScoreImportQueueEvents = new QueueEvents(ScoreImportQueue.name, {
	connection: { host: Environment.redisUrl, port: 6379 },
});

export async function CloseScoreImportQueue() {
	await ScoreImportQueueEvents.close();
	return ScoreImportQueue.close();
}
