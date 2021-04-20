import connectRedis from "connect-redis";
import expressSession from "express-session";
import CreateLogCtx from "../logger";
import redis from "redis";

const logger = CreateLogCtx("redis-store.ts");

export const RedisStore = connectRedis(expressSession);
logger.info("Instantiated Redis Store");

export const RedisClient = redis.createClient();
logger.info("Instantiated Redis Client");

export function CloseRedisConnection() {
    return RedisClient.quit();
}
