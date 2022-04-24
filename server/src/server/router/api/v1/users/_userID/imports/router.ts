import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";

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
	const userID = req[SYMBOL_TachiData]!.requestedUser!.id;

	let timeFinished = Infinity;

	if (req.query.timeFinished) {
		timeFinished = Number(req.query.timeFinished as string);

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
			timeFinished: { $lt: timeFinished },
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
	const userID = req[SYMBOL_TachiData]!.requestedUser!.id;

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

export default router;
