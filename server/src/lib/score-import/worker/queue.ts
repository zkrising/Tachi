import { Queue, QueueEvents } from "bullmq";
import { Environment, TachiConfig } from "lib/setup/config";

const ScoreImportQueue = new Queue(`${TachiConfig.NAME} Score Import Queue`, {
	connection: { host: Environment.redisUrl, port: 6379 },
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: 10, // keep the last 10 failed jobs, but start pruning beyond that.
	},
});

export default ScoreImportQueue;

export const ScoreImportQueueEvents = new QueueEvents(ScoreImportQueue.name, {
	connection: { host: Environment.redisUrl, port: 6379 },
});

export async function CloseScoreImportQueue() {
	await ScoreImportQueueEvents.close();
	return ScoreImportQueue.close();
}
