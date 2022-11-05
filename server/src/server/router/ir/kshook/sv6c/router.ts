import { Router } from "express";
import db from "external/mongo/db";
import { MODEL_SDVX3_KONASTE } from "lib/constants/ea3id";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { ParseEA3SoftID } from "utils/ea3id";
import { IsNullishOrEmptyStr } from "utils/misc";
import type { RequestHandler } from "express";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

const ValidateHeaders: RequestHandler = (req, res, next) => {
	const agent = req.header("User-Agent");

	if (IsNullishOrEmptyStr(agent)) {
		logger.debug(
			`Rejected KsHook client with no agent from user ${req[SYMBOL_TACHI_API_AUTH].userID}.`
		);
		return res.status(400).json({
			success: false,
			error: `Invalid User-Agent.`,
		});
	}

	if (!agent.startsWith("kshook/")) {
		logger.info(
			`Rejected KsHook client with invalid agent ${agent} from user ${req[SYMBOL_TACHI_API_AUTH].userID}.`
		);
		return res.status(400).json({
			success: false,
			error: `Invalid User-Agent ${agent} - expected KsHook client.`,
		});
	}

	// We don't currently need to check the version or anything i don't think.
	// We should be good.

	const softID = req.header("X-Software-Model");

	if (IsNullishOrEmptyStr(softID)) {
		logger.debug(
			`received request without X-Software-Model from ${req[SYMBOL_TACHI_API_AUTH].userID}.`
		);
		return res.status(400).json({
			success: false,
			error: `Invalid X-Software-Model.`,
		});
	}

	try {
		const modelInfo = ParseEA3SoftID(softID);

		if (modelInfo.model !== MODEL_SDVX3_KONASTE) {
			logger.info(
				`received unexpected softID ${softID}. Expected ${MODEL_SDVX3_KONASTE} as model.`
			);
			return res.status(400).json({
				success: false,
				error: `Invalid softID ${softID}.`,
			});
		}
	} catch (err) {
		logger.info(`Invalid softID from ${req[SYMBOL_TACHI_API_AUTH].userID}.`, { err });
		return res.status(400).json({
			success: false,
			error: `Invalid X-Software-Model.`,
		});
	}

	next();
};

router.use(ValidateHeaders);

/**
 * Saves a SDVX Konaste score.
 *
 * @name POST /ir/kshook/sv6c/score/save
 */
router.post("/score/save", async (req, res) => {
	const responseData = await ExpressWrappedScoreImportMain(
		req[SYMBOL_TACHI_API_AUTH].userID!,
		true,
		"ir/kshook-sv6c",
		[req.safeBody]
	);

	if (!responseData.body.success) {
		// in-air rewrite description to error.
		// @ts-expect-error Hack!
		responseData.body.error = responseData.body.description;

		// @ts-expect-error Hack!
		delete responseData.body.description;
	}

	return res.status(responseData.statusCode).json(responseData.body);
});

/**
 * Imports statically from KsHook. Analogous to fervidex-static.
 *
 * @name POST /ir/kshook/sv6c/score/export
 */
router.post("/score/export", async (req, res) => {
	const userID = req[SYMBOL_TACHI_API_AUTH].userID!;

	const settings = await db["kshook-sv6c-settings"].findOne({ userID });

	if (!settings || !settings.forceStaticImport) {
		return res.status(200).json({
			success: true,
			description: "Static importing is disabled. Ignoring static import request.",
			body: {},
		});
	}

	await db["kshook-sv6c-settings"].update(
		{ userID },
		{
			$set: { forceStaticImport: false },
		}
	);

	logger.info(`SV6C-static Request Received from ${userID}: `, { content: req.safeBody });

	const responseData = await ExpressWrappedScoreImportMain(
		userID,
		true,
		"ir/kshook-sv6c-static",
		[req.safeBody]
	);

	if (!responseData.body.success) {
		// in-air rewrite description to error.
		// @ts-expect-error Hack!
		responseData.body.error = responseData.body.description;

		// @ts-expect-error Hack!
		delete responseData.body.description;
	}

	return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
