import { CONFIG } from "../../lib/setup/config";
import { RequestHandler } from "express";

/**
 * Middleware that makes the route only available under Bokutachi.
 * Note that if the special type "tachi" is set (which is set for testing purposes)
 * this restriction is bypassed.
 */
export const RequireBokutachi: RequestHandler = (req, res, next) => {
	if (CONFIG.TYPE === "btchi" || CONFIG.TYPE === "omni") {
		return next();
	}

	return res.status(404).send({
		success: false,
		description: `The route ${req.url} is only available on Bokutachi.`,
	});
};

/**
 * Middleware that makes the route only available under Kamaitachi.
 * Note that if the special type "tachi" is set (which is set for testing purposes)
 * this restriction is bypassed.
 */
export const RequireKamaitachi: RequestHandler = (req, res, next) => {
	if (CONFIG.TYPE === "ktchi" || CONFIG.TYPE === "omni") {
		return next();
	}

	return res.status(404).send({
		success: false,
		description: `The route ${req.url} is only available on Kamaitachi.`,
	});
};
