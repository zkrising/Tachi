import { NextFunction, Request, Response } from "express";

export function RequireLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (!req.session.ktchi?.userID) {
        return res.status(401).json({
            success: false,
            description: `You are not authorised to make this request.`,
        });
    }

    next();
}
