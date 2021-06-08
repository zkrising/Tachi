import { NextFunction, Request, Response } from "express";
import CreateLogCtx from "../../lib/logger/logger";

const logger = CreateLogCtx(__filename);

export function RequireLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (!req.session.tachi?.userID) {
        logger.info(`Received unauthorised request from ${req.ip} from ${req.originalUrl}`);

        return res.status(401).json({
            success: false,
            description: `You are not authorised to perform this action.`,
        });
    }

    next();
}
