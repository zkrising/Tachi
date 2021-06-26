import { RequestHandler } from "express";
import db from "../../../../../../external/mongo/db";
import { AssignToReqTachiData } from "../../../../../../utils/req-tachi-data";

export const GetScoreFromParam: RequestHandler = async (req, res, next) => {
	if (!req.params.scoreID) {
		return res.status(400).json({
			success: false,
			description: `No scoreID given, but one was expected.`,
		});
	}

	const score = await db.scores.findOne({ scoreID: req.params.scoreID });

	if (!score) {
		return res.status(404).json({
			success: false,
			description: `This score does not exist.`,
		});
	}

	AssignToReqTachiData(req, { scoreDoc: score });
};
