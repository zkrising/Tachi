import { TachiConfig, Environment } from "lib/setup/config";
import type { RequestHandler } from "express-serve-static-core";

/**
 * Middleware that makes the route only available under Bokutachi.
 * Note that if the special type "omni" is set (which is set for testing/dev purposes)
 * this restriction is bypassed.
 */
export const RequireBokutachi: RequestHandler = (req, res, next) => {
	if (TachiConfig.TYPE === "btchi" || TachiConfig.TYPE === "omni") {
		next();
		return;
	}

	return res.status(404).send({
		success: false,
		description: `The route ${req.url} is only available on Bokutachi.`,
	});
};

/**
 * Middleware that makes the route only available under Kamaitachi.
 * Note that if the special type "omni" is set (which is set for testing/dev purposes)
 * this restriction is bypassed.
 */
export const RequireKamaitachi: RequestHandler = (req, res, next) => {
	if (TachiConfig.TYPE === "ktchi" || TachiConfig.TYPE === "omni") {
		next();
		return;
	}

	return res.status(404).send({
		success: false,
		description: `The route ${req.url} is only available on Kamaitachi.`,
	});
};

/**
 * Makes a route only available in local development or in testing.
 *
 * This is intended for utils that interact frivolously with the host system,
 * such as the seeds-api, which fetches local data from the user's hard drive
 * at an expected checkout location.
 */
export const RequireLocalDevelopment: RequestHandler = (req, res, next) => {
	if (Environment.nodeEnv === "dev" || Environment.nodeEnv === "test") {
		next();
		return;
	}

	return res.status(404).send({
		success: false,
		description: `The route ${req.url} is only available in local development or testing environments.`,
	});
};
