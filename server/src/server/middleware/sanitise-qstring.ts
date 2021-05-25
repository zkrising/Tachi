import { NextFunction, Request, Response } from "express";

/**
 * Disallow complex query strings by enforcing single key:value pairs.
 */
function SanitiseQString(req: Request, res: Response, next: NextFunction) {
    if (req.method === "GET") {
        for (const data in req.query) {
            if (typeof req.query[data] !== "string") {
                return res.status(400).json({
                    success: false,
                    description: `Invalid request with key ${data}`,
                });
            }
        }
    }

    next();
}

export default SanitiseQString;
