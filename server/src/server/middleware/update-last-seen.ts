import db from "external/mongo/db";
import type { RequestHandler } from "express";

export const UpdateLastSeen: RequestHandler = (req, res, next) => {
	if (req.session.tachi?.user.id === undefined) {
		next();
		return;
	}

	if (req.session.tachi.settings.preferences.invisible) {
		next();
		return;
	}

	// fire, but we have no reason to await it.
	void db.users.update(
		{ id: req.session.tachi.user.id },
		{
			$set: {
				lastSeen: Date.now(),
			},
		}
	);

	next();
};
