import connectRedis from "connect-redis";
import expressSession from "express-session";
import CreateLogCtx from "../logger";
import redis from "redis";

const logger = CreateLogCtx("redis-store.ts");

export const RedisStore = connectRedis(expressSession);
logger.info("Instantiated Redis Store");

export const RedisClient = redis.createClient();
logger.info("Instantiated Redis Client");

function EmitCritical() {
    if (!RedisClient.connected) {
        logger.crit(`Could not connect to redis in time. No more information is available.`);
    }
}

let ref = setTimeout(EmitCritical, 10000);

RedisClient.on("connect", () => {
    logger.info(`Connected to Redis.`);

    clearTimeout(ref);
});

export function CloseRedisConnection() {
    return RedisClient.quit();
}
