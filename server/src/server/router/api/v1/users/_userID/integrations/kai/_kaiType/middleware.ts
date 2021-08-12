import { RequestHandler } from "express";

export const ValidateKaiType: RequestHandler = (req, res, next) => {
	if (!["min", "flo", "eag"].includes(req.params.kaiType.toLowerCase())) {
		return res.status(400).json({
			success: false,
			description: `Invalid kaiType - Expected min, flo or eag.`,
		});
	}

	return next();
};
