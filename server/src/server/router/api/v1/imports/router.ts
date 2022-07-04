import { GetImportFromParam, RequireOwnershipOfImportOrAdmin } from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { JOB_RETRY_COUNT } from "lib/constants/tachi";
import { RevertImport } from "lib/imports/imports";
import CreateLogCtx from "lib/logger/logger";
import ScoreImportQueue, { ScoreImportQueueEvents } from "lib/score-import/worker/queue";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { RequirePermissions } from "server/middleware/auth";
import { GetRelevantSongsAndCharts } from "utils/db";
import { GetTachiData } from "utils/req-tachi-data";
import { GetUserWithID } from "utils/user";
import type { ScoreImportWorkerReturns } from "lib/score-import/worker/types";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Retrieve an import with this ID.
 *
 * @name GET /api/v1/imports/:importID
 */
router.get("/:importID", GetImportFromParam, async (req, res) => {
	const importDoc = GetTachiData(req, "importDoc");

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
 * Delete this import and revert it from having ever happened. This un-imports all
 * of the scores that were imported.
 *
 * Must be a request from the owner of this import.
 *
 * Counterintuitively, this endpoint requires the "delete_score" permission. This is
 * because reverting an import is actually just deleting all of its scores.
 *
 * @name POST /api/v1/imports/:importID/revert
 */
router.post(
	"/:importID/revert",
	GetImportFromParam,
	RequireOwnershipOfImportOrAdmin,
	RequirePermissions("delete_score"),
	async (req, res) => {
		const importDoc = GetTachiData(req, "importDoc");

		await RevertImport(importDoc);

		return res.status(200).json({
			success: true,
			description: `Reverted import.`,
			body: {},
		});
	}
);

// Finding jobs is slightly harder than just doing a key lookup, because of retrying.
async function FindImportJob(importID: string) {
	const possibleImportIDs = [];

	for (let i = 1; i <= JOB_RETRY_COUNT; i++) {
		possibleImportIDs.push(`${importID}:TRY${i}`);
	}

	// Note that instead of the cleaner await-inside-for here, we parallelise this
	// for performance.
	// Just for scalings sake.
	const maybeJob = (
		await Promise.all(possibleImportIDs.map((i) => ScoreImportQueue.getJob(i)))
	).find((k) => k);

	return maybeJob;
}

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

	const job = await FindImportJob(req.params.importID);

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
		const content = (await job.waitUntilFinished(
			ScoreImportQueueEvents
		)) as ScoreImportWorkerReturns;

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
		}

		return res.status(content.statusCode).json({
			success: false,
			description: content.description,
		});
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
