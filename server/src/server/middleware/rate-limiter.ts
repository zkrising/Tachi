import rateLimit from "express-rate-limit";
import { RedisClient } from "external/redis/redis";
import { ONE_MINUTE } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import RateLimitRedis from "rate-limit-redis";
import { integer } from "tachi-common";

const logger = CreateLogCtx(__filename);

const store =
	Environment.nodeEnv === "production" || Environment.nodeEnv === "staging"
		? new RateLimitRedis({ prefix: `${TachiConfig.NAME}-RL:`, client: RedisClient })
		: undefined; // undefined forces a default to an in-memory store

export function ClearTestingRateLimitCache() {
	// ???
	NormalRateLimitMiddleware.resetKey(`::ffff:127.0.0.1`);
	AggressiveRateLimitMiddleware.resetKey(`::ffff:127.0.0.1`);
	HyperAggressiveRateLimitMiddleware.resetKey(`::ffff:127.0.0.1`);
}

const CreateRateLimitOptions = (max: integer, windowMs?: number): rateLimit.Options => ({
	max,
	onLimitReached: (req) => {
		logger.warn(`User ${req.ip} hit rate limit.`, {
			url: req.url,
			method: req.method,
			hideFromConsole: ["req"],
		});
	},
	store,
	message: {
		success: false,
		description: `You have exceeded ${ServerConfig.RATE_LIMIT} requests per minute. Please wait.`,
		status: 429,
		message: "You're being rate limited.",
	},
	windowMs,
});

// 100 requests / minute is the current cap
export const NormalRateLimitMiddleware = rateLimit(CreateRateLimitOptions(ServerConfig.RATE_LIMIT));

// 15 requests every 10 minutes.
export const AggressiveRateLimitMiddleware = rateLimit(CreateRateLimitOptions(10, ONE_MINUTE * 10));

// 2 requests every 20 minutes.
export const HyperAggressiveRateLimitMiddleware = rateLimit(
	CreateRateLimitOptions(2, ONE_MINUTE * 20)
);
