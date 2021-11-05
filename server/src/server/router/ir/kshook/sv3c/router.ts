import { Router, RequestHandler } from "express";
import { MODEL_SDVX3_KONASTE } from "lib/constants/ea3id";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { ParseKsHookSV3C } from "lib/score-import/import-types/ir/kshook-sv3c/parser";
import { ParseEA3SoftID } from "utils/ea3id";
import { GetUserWithIDGuaranteed } from "utils/user";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

const ValidateHeaders: RequestHandler = (req, res, next) => {
	const agent = req.header("User-Agent");

	if (!agent) {
		logger.debug(
			`Rejected KsHook client with no agent from user ${req[SYMBOL_TachiAPIAuth].userID!}.`
		);
		return res.status(400).json({
			success: false,
			error: `Invalid User-Agent.`,
		});
	}

	if (!agent.startsWith("kshook/")) {
		logger.info(
			`Rejected KsHook client with invalid agent ${agent} from user ${req[SYMBOL_TachiAPIAuth]
				.userID!}.`
		);
		return res.status(400).json({
			success: false,
			error: `Invalid User-Agent ${agent} - expected KsHook client.`,
		});
	}

	// We don't currently need to check the version or anything i don't think.
	// We should be good.

	const softID = req.header("X-Software-Model");

	if (!softID) {
		logger.debug(
			`Recieved request without X-Software-Model from ${req[SYMBOL_TachiAPIAuth].userID!}.`
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
				`Recieved unexpected softID ${softID}. Expected ${MODEL_SDVX3_KONASTE} as model.`
			);
			return res.status(400).json({
				success: false,
				error: `Invalid softID ${softID}.`,
			});
		}
	} catch (err) {
		logger.info(`Invalid softID from ${req[SYMBOL_TachiAPIAuth].userID!}.`, { err });
		return res.status(400).json({
			success: false,
			error: `Invalid X-Software-Model.`,
		});
	}

	return next();
};

/**
 * Saves a SDVX Konaste score.
 *
 * @name POST /ir/kshook/sv3c/score/save
 */
router.post("/score/save", async (req, res) => {
	const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth].userID!);

	const responseData = await ExpressWrappedScoreImportMain(
		userDoc,
		true,
		"ir/kshook-sv3c",
		(logger) => ParseKsHookSV3C(req.body, logger)
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
