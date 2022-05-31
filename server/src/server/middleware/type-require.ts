import { TachiConfig } from "lib/setup/config";
import type { RequestHandler } from "express";

/**
 * Middleware that makes the route only available under Bokutachi.
 * Note that if the special type "omni" is set (which is set for testing purposes)
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
 * Note that if the special type "omni" is set (which is set for testing purposes)
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
