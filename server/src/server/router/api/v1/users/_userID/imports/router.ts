import { Router } from "express";
import db from "external/mongo/db";
import { TachiConfig } from "lib/setup/config";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { DeleteUndefinedProps, IsNonEmptyString } from "utils/misc";
import { GetTachiData } from "utils/req-tachi-data";
import type { FilterQuery } from "mongodb";
import type { ImportTrackerDocument, ImportTypes } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Query this user's imports. Returns the 500 most recently-finished imports.
 *
 * @param importType - Optionally, limit the returns to only this import type.
 * @param userIntent - Optionally, limit returns to only those with or without userIntent.
 *
 * @name GET /api/v1/users/:userID/imports
 */
router.get(
	"/",
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

		const query = {
			userIntent,
			userID,
			importType,
		};

		DeleteUndefinedProps(query);

		const imports = await db.imports.find(query, {
			sort: { timeFinished: -1 },
			limit: 500,
		});

		return res.status(200).json({
			success: true,
			description: `Found ${imports.length} imports.`,
			body: imports,
		});
	}
);

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

		const query: FilterQuery<ImportTrackerDocument> = {
			type: "FAILED",
			userIntent,
			userID,
			importType,
		};

		DeleteUndefinedProps(query);

		const trackers = await db["import-trackers"].find(query, {
			sort: { timeStarted: -1 },
			limit: 500,
		});

		return res.status(200).json({
			success: true,
			description: `Found ${trackers.length} failed imports.`,
			body: trackers,
		});
	}
);

export default router;
