import RateLimitRedis from "rate-limit-redis";
import { CONFIG } from "lib/setup/config";
import rateLimit from "express-rate-limit";
import CreateLogCtx from "lib/logger/logger";
import { RedisClient } from "external/redis/redis";

const logger = CreateLogCtx(__filename);

const store =
	process.env.NODE_ENV === "production"
		? new RateLimitRedis({ prefix: `${CONFIG.TYPE}-RL:`, client: RedisClient })
		: undefined; // undefined forces a default to an in-memory store

export function ClearTestingRateLimitCache() {
	// ???
	RateLimitMiddleware.resetKey(`::ffff:127.0.0.1`);
}

// 100 requests / minute is the current cap
export const RateLimitMiddleware = rateLimit({
	max: 100,
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
		description: "You have exceeded 100 requests per minute. Please wait.",
	} as any, // @todo #170 report this as a bug with rate-limit types.,
});
