import { RequestHandler } from "express";
import CreateLogCtx from "../../lib/logger/logger";

const logger = CreateLogCtx(__filename);

export const RequireLoggedInSession: RequestHandler = (req, res, next) => {
	if (!req.session.tachi?.userID) {
		logger.info(`Received unauthorised request from ${req.ip} from ${req.originalUrl}`);

		return res.status(401).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	next();
};

export const RequireNotLoggedInSession: RequestHandler = (req, res, next) => {
	if (req.session.tachi?.userID) {
		logger.info(`Dual log-in attempted from ${req.session.tachi.userID}`);
		return res.status(409).json({
			success: false,
			description: `You cannot perform this while logged in.`,
		});
	}

	return next();
};
