import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { AssignToReqTachiData } from "utils/req-tachi-data";

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

export const UpdateSessionViewcount: RequestHandler = async (req, res, next) => {
	const session = req[SYMBOL_TachiData]!.sessionDoc!;

	// Maybe we could improve how this cache works using redis. Maybe.
	// we don't need to actually check timestamp - this collection expires documents every 24hours.
	const hasViewedRecently = await db["session-view-cache"].findOne({
		sessionID: session.sessionID,
		ip: req.ip,
	});

	if (hasViewedRecently) {
		return next();
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
	} catch (err) {
		logger.warn(
			`Race condition protection triggered in UpdateSessionViewcount for ${session.sessionID}. Ignoring.`
		);
	}

	return next();
};
