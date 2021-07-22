import CreateLogCtx from "lib/logger/logger";
import { RequestHandler, Response } from "express-serve-static-core";

const logger = CreateLogCtx(__filename);

// https://stackoverflow.com/a/64546368/11885828
// Taken from Jonathan Turnock - This is an *incredibly* nice
// solution for post-request express logging!

const ResSendInteceptor = (res: Response, send: Response["send"]) => (content: unknown) => {
	// @ts-expect-error general monkeypatching error
	res.contentBody = content;
	res.send = send;
	res.send(content);
};

export const RequestLoggerMiddleware: RequestHandler = (req, res, next) => {
	logger.debug(`Received request ${req.method} ${req.url}.`, {
		query: req.query,
		body: req.body,
	});

	// @ts-expect-error we're doing some wacky monkey patching
	res.send = ResSendInteceptor(res, res.send);

	res.on("finish", () => {
		const contents = {
			// @ts-expect-error we're doing some monkey patching
			body: res.contentBody,
			statusCode: res.statusCode,
		};

		if (res.statusCode < 400) {
			logger.verbose(`(${req.method} ${req.url}) Returned`, contents);
		} else if (res.statusCode < 500) {
			logger.info(`(${req.method} ${req.url}) Returned`, contents);
		} else {
			logger.error(`(${req.method} ${req.url}) Returned`, contents);
		}
	});

	return next();
};
