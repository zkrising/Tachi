import { RequestHandler } from "express";
import db from "external/mongo/db";

export const UpdateLastSeen: RequestHandler = (req, res, next) => {
	if (!req.session.tachi?.user.id) {
		return next();
	}

	if (req.session.tachi.settings.preferences.invisible) {
		return next();
	}

	// fire, but we have no reason to await it.
	db.users.update(
		{ id: req.session.tachi.user.id },
		{
			$set: {
				lastSeen: Date.now(),
			},
		}
	);

	return next();
};
