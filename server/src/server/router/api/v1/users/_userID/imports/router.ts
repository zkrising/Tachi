import { Router } from "express";
import db from "external/mongo/db";
import { TachiConfig } from "lib/setup/config";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { IsNonEmptyString } from "utils/misc";
import { GetTachiData } from "utils/req-tachi-data";
import type { ImportTypes } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Return minimal information about up to 500 of this user's most recent imports.
 * To control where that 500 starts from, pass the timeFinished param.
 *
 * This endpoint is intended to be used by developers to triage certain bugs.
 *
 * @param timeFinished - Where to start counting this users 500 imports from, this
 * should be a unix timestamp in milliseconds.
 *
 * @name GET /api/v1/users/:userID/imports
 */
router.get("/", prValidate({ timeFinished: "*string" }), async (req, res) => {
	const userID = GetTachiData(req, "requestedUser").id;

	const query = req.query as { timeFinished: string | undefined };

	let timeFinished = Infinity;

	if (IsNonEmptyString(query.timeFinished)) {
		timeFinished = Number(query.timeFinished);

		if (Number.isNaN(timeFinished)) {
			return res.status(400).json({
				success: false,
				description: `Couldn't read timeFinished as unix milliseconds.`,
			});
		}
	}

	const imports = await db.imports.find(
		{
			userID,
			timeFinished: { $lte: timeFinished },
		},
		{
			limit: 500,
			sort: { timeFinished: -1 },
		}
	);

	return res.status(200).json({
		success: true,
		description: `Found ${imports.length} imports.`,
		body: imports,
	});
});

/**
 * Return all of this user's imports that were made with user intent.
 *
 * Note that we can safely do this without rate limiting, because an import with
 * userIntent implies that the user uploaded a file or something similar. Intent
 * Imports are not vulnerable to being brutalised by every fervidex upload or similar.
 *
 * @name GET /api/v1/users/:userID/imports/with-user-intent
 */
router.get("/with-user-intent", async (req, res) => {
	const userID = GetTachiData(req, "requestedUser").id;

	const importsWithIntent = await db.imports.find({
		userID,
		userIntent: true,
	});

	return res.status(200).json({
		success: true,
		description: `Found ${importsWithIntent.length} imports that were made with user-intent.`,
		body: importsWithIntent,
	});
});

/**
 * Return this users 500 most recent failed imports.
 *
 * @param userIntent - Optionally, Whether to limit returns to only those with userIntent or without.
 * @param importType - Optionally, Whether to limit returns to only a specific importType.
 *
 * @name GET /api/v1/users/:userID/imports/failed
 */
router.get(
	"/failed",
	prValidate({
		importType: p.optional(p.isIn(TachiConfig.IMPORT_TYPES)),
		userIntent: p.optional(p.isIn("true", "false")),
	}),
	async (req, res) => {
		const userID = GetTachiData(req, "requestedUser").id;

		const importType = req.query.importType as ImportTypes | undefined;

		// all query input ends up as strings, so we need convert it into an optional
		// boolean
		const userIntent =
			req.query.userIntent === undefined ? undefined : req.query.userIntent === "true";

		const trackers = await db["import-trackers"].find(
			{
				type: "FAILED",
				userIntent,
				userID,
				importType,
			},
			{
				sort: { timeStarted: -1 },
				limit: 500,
			}
		);

		return res.status(200).json({
			success: true,
			description: `Found ${trackers.length} failed imports.`,
			body: trackers,
		});
	}
);

export default router;
