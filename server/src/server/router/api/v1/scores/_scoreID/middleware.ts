import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { IsRequesterAdmin } from "utils/user";

const logger = CreateLogCtx(__filename);

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

export const RequireOwnershipOfScoreOrAdmin: RequestHandler = async (req, res, next) => {
	const score = req[SYMBOL_TachiData]!.scoreDoc!;
	const userID = req[SYMBOL_TachiAPIAuth].userID;

	if (userID === null) {
		return res.status(401).json({
			success: false,
			description: `You are not authorised as anyone, and this endpoint requires us to know who you are.`,
		});
	}

	if (score.userID !== userID) {
		if (await IsRequesterAdmin(req[SYMBOL_TachiAPIAuth])) {
			logger.info(`Admin ${userID} interacted with someone elses .`);
			return next();
		}

		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this action.`,
		});
	}

	return next();
};
