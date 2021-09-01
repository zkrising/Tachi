import CreateLogCtx from "lib/logger/logger";
import redis from "redis";

const logger = CreateLogCtx(__filename);

logger.verbose("Instantiated Redis Store");

export const RedisClient = redis.createClient();
logger.verbose("Instantiated Redis Client");

function EmitCritical() {
	/* istanbul ignore next */
	if (!RedisClient.connected) {
		logger.crit(`Could not connect to redis in time. No more information is available.`);
	}
}

const ref = setTimeout(EmitCritical, 30000);

RedisClient.on("connect", () => {
	logger.verbose(`Connected to Redis.`);

	clearTimeout(ref);
});

export function CloseRedisConnection() {
	return RedisClient.quit();
}
