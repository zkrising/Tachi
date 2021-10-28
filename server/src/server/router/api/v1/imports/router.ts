import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetRelevantSongsAndCharts } from "utils/db";
import { GetUserWithID } from "utils/user";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.get("/:importID", async (req, res) => {
	const importDoc = await db.imports.findOne({
		importID: req.params.importID,
	});

	if (!importDoc) {
		return res.status(404).json({
			success: false,
			description: `This import does not exist.`,
		});
	}

	const scores = await db.scores.find({
		scoreID: { $in: importDoc.scoreIDs },
	});

	const { songs, charts } = await GetRelevantSongsAndCharts(scores, importDoc.game);

	const sessions = await db.sessions.find({
		sessionID: { $in: importDoc.createdSessions.map((e) => e.sessionID) },
	});

	const user = await GetUserWithID(importDoc.userID);

	if (!user) {
		logger.severe(`User ${importDoc.userID} doesn't exist, yet has a session?`);
		return res.status(500).json({
			success: false,
			description: `An internal server error has occured.`,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Returned info about this session.`,
		body: {
			scores,
			songs,
			charts,
			sessions,
			import: importDoc,
			user,
		},
	});
});

export default router;
