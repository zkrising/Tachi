import { RequestHandler } from "express";
import db from "../../../../../../external/mongo/db";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "../../../../../../lib/constants/tachi";
import { AssignToReqTachiData } from "../../../../../../utils/req-tachi-data";

export const GetSessionFromParam: RequestHandler = async (req, res, next) => {
	const session = await db.sessions.findOne({
		sessionID: req.params.sessionID,
	});

	if (!session) {
		return res.status(404).json({
			success: false,
			description: `This session does not exist.`,
		});
	}

	AssignToReqTachiData(req, { sessionDoc: session });

	return next();
};

export const RequireOwnershipOfSession: RequestHandler = (req, res, next) => {
	const userID = req[SYMBOL_TachiAPIAuth].userID;
	const session = req[SYMBOL_TachiData]!.sessionDoc!;

	if (userID !== session.userID) {
		return res.status(403).json({
			success: false,
			description: `You are not authorised to modify this session.`,
		});
	}

	return next();
};
