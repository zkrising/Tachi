import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

const logger = CreateLogCtx(__filename);

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

export const UpdateSessionViewcount: RequestHandler = async (req, res, next) => {
	const session = GetTachiData(req, "sessionDoc");

	// Maybe we could improve how this cache works using redis. Maybe.
	// we don't need to actually check timestamp - this collection expires documents every 24hours.
	const hasViewedRecently = await db["session-view-cache"].findOne({
		sessionID: session.sessionID,
		ip: req.ip,
	});

	if (hasViewedRecently) {
		next();
		return;
	}

	// This sometimes fails due to a race condition in the above statement.
	// @hack I've just lazily wrapped this in a try catch -> continue flow.
	// Maybe there'll be a neater solution.
	try {
		await db["session-view-cache"].insert({
			sessionID: session.sessionID,
			ip: req.ip,
			timestamp: Date.now(),
		});

		await db.sessions.update(
			{
				sessionID: session.sessionID,
			},
			{
				$inc: {
					views: 1,
				},
			}
		);

		// increment locally so that the right state is shown to the end user.
		session.views++;
	} catch (_err) {
		logger.debug(
			`Race condition protection triggered in UpdateSessionViewcount for ${session.sessionID}. Ignoring.`
		);
	}

	next();
};
