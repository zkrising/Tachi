import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

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

	next();
};

export const RequireOwnershipOfSession: RequestHandler = (req, res, next) => {
	const userID = req[SYMBOL_TACHI_API_AUTH].userID;
	const session = GetTachiData(req, "sessionDoc");

	if (userID !== session.userID) {
		return res.status(403).json({
			success: false,
			description: `You are not authorised to modify this session.`,
		});
	}

	next();
};
