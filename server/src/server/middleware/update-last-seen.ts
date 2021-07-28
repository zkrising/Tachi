import { RequestHandler } from "express";
import db from "external/mongo/db";

export const UpdateLastSeen: RequestHandler = async (req, res, next) => {
	if (!req.session.tachi?.userID) {
		return next();
	}

	// fire, but we have no reason to await it.
	db.users.update(
		{ id: req.session.tachi.userID },
		{
			$set: {
				lastSeen: Date.now(),
			},
		}
	);

	return next();
};
