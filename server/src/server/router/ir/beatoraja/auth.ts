import { RequestHandler } from "express";

export const ValidateIRClientVersion: RequestHandler = (req, res, next) => {
	const header = req.header("X-TachiIR-Version");

	return next();
};
