import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";

export const GetScoreFromParam: RequestHandler = async (req, res, next) => {
	const score = await db.scores.findOne({ scoreID: req.params.scoreID });

	if (!score) {
		return res.status(404).json({
			success: false,
			description: `This score does not exist.`,
		});
	}

	AssignToReqTachiData(req, { scoreDoc: score });

	return next();
};

export const RequireOwnershipOfScore: RequestHandler = (req, res, next) => {
	const score = req[SYMBOL_TachiData]!.scoreDoc!;
	const userID = req[SYMBOL_TachiAPIAuth].userID!;

	if (score.userID !== userID) {
		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	return next();
};
