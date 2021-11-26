import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import ScoreImportQueue, { ScoreImportQueueEvents } from "lib/score-import/worker/queue";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { GetRelevantSongsAndCharts } from "utils/db";
import { GetUserWithID } from "utils/user";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Retrieve an import with this ID.
 *
 * @name GET /api/v1/imports/:importID
 */
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

/**
 * Retrieve the status of an ongoing import.
 * If the import has been finalised and was successful, return 200.
 *
 * If the import is ongoing, return its progress.
 *
 * If the import was never ongoing, return 404.
 *
 * If the import was finalised and was unsuccessful (i.e. threw a fatal error)
 * return its error information in expressified form.
 *
 * @name GET /api/v1/import/:importID/poll-status
 */
router.get("/:importID/poll-status", async (req, res) => {
	if (!ServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER) {
		return res.status(501).json({
			success: false,
			description: `${TachiConfig.NAME} does not use an external score import worker. Polling imports is not possible. This import may be ongoing, or it may have never occured.`,
		});
	}

	const importDoc = await db.imports.findOne({ importID: req.params.importID });

	if (importDoc) {
		return res.status(200).json({
			success: true,
			description: `Import was completed!`,
			body: {
				importStatus: "completed",
				import: importDoc,
			},
		});
	}

	const job = await ScoreImportQueue.getJob(req.params.importID);

	if (!job) {
		return res.status(404).json({
			success: false,
			description: `There is no ongoing import here.`,
		});
	}

	// job.isFailed() actually means a critical error has occured.
	// As in, an unhandled exception was thrown.
	if (await job.isFailed()) {
		logger.error("Internal Server Error with job?", { job });

		return res.status(500).json({
			success: false,
			description: `An internal service error has occured with this import. This has been reported!`,
		});
	} else if (await job.isCompleted()) {
		const content = await job.waitUntilFinished(ScoreImportQueueEvents);

		// Since job.isFailed() is for whether a job had a fatal exception
		// or not. We still want to check whether a job failed from say,
		// nonsense user input.
		// As such, if content.success == true, then the import was
		// successful.
		// Else, it was a "score import fatal error", which means the user
		// screwed something up and we had to bail on the import.
		if (content.success) {
			return res.status(200).json({
				success: true,
				description: `Import was completed!`,
				body: {
					importStatus: "completed",
					import: content.importDocument,
				},
			});
		} else {
			return res.status(content.statusCode).json({
				success: false,
				description: content.message,
			});
		}
	}

	const progress = job.progress;

	return res.status(200).json({
		success: true,
		description: `Import is ongoing.`,
		body: {
			importStatus: "ongoing",
			progress: progress === 0 ? { description: "Starting up import." } : progress,
		},
	});
});

export default router;
