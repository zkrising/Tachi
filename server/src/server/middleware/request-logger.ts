import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import type { RequestHandler, Response } from "express-serve-static-core";
import type { APITokenDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

// https://stackoverflow.com/a/64546368/11885828
// Taken from Jonathan Turnock - This is an *incredibly* nice
// solution for post-request express logging!

const ResJsonInteceptor = (res: Response, json: Response["json"]) => (content: unknown) => {
	// @ts-expect-error general monkeypatching error
	res.contentBody = content;
	res.json = json;
	res.json(content);
};

export const RequestLoggerMiddleware: RequestHandler = (req, res, next) => {
	const safeBody: Record<string, unknown> = {};

	for (const [k, v] of Object.entries(req.safeBody)) {
		// Keys that start with ! are private information,
		// and should not ever be logged.
		if (k.startsWith("!")) {
			safeBody[k] = "[OMITTED]";
		} else {
			safeBody[k] = v;
		}
	}

	logger.debug(`Received request ${req.method} ${req.originalUrl}.`, {
		query: req.query,
		body: safeBody,
	});

	// @ts-expect-error we're doing some wacky monkey patching
	res.json = ResJsonInteceptor(res, res.json);

	res.on("finish", () => {
		const contents = {
			// @ts-expect-error we're doing some monkey patching - contentBody is what we're returning.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			body: res.contentBody,
			statusCode: res.statusCode,
			requestQuery: req.query,
			requestBody: safeBody,

			// This might actually be undefined, as it could be called in some weird scenarios?
			from: (req[SYMBOL_TACHI_API_AUTH] as APITokenDocument | undefined)?.userID ?? null,
			fromIp: req.ip,
		};

		// special overrides
		// This stuff is spam, so we'll just not log it.
		if (res.statusCode === 429) {
			return;
		}

		// 403 bannings like this are also spam.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (contents.body?.description === `You are banned from ${TachiConfig.NAME}.`) {
			return;
		}

		if (res.statusCode < 400 || res.statusCode === 404) {
			logger.verbose(
				`(${req.method} ${req.originalUrl}) Returned ${res.statusCode}.`,
				contents
			);
		} else if (res.statusCode < 500) {
			logger.info(`(${req.method} ${req.originalUrl}) Returned ${res.statusCode}.`, contents);
		} else {
			logger.error(
				`(${req.method} ${req.originalUrl}) Returned ${res.statusCode}.`,
				contents
			);
		}
	});

	next();
};
