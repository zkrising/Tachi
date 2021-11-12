import Queue from "bull";
import { RedisClient } from "external/redis/redis";
import { Environment, TachiConfig } from "lib/setup/config";

const ScoreImportQueue = new Queue(`${TachiConfig.NAME} Score Import Queue`, Environment.redisUrl);

export default ScoreImportQueue;

export function CloseScoreImportQueue() {
	return ScoreImportQueue.close();
}
