import { Queue, QueueEvents } from "bullmq";
import { Environment, TachiConfig } from "lib/setup/config";

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
