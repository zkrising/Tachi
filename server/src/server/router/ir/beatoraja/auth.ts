import { RequestHandler } from "express";

export const ValidateIRClientVersion: RequestHandler = (req, res, next) => {
	const header = req.header("X-TachiIR-Version");

	if (header !== "2.0.0") {
		return res.status(400).json({
			success: false,
			description: "Invalid BokutachiIR client version.",
		});
	}

	return next();
};
