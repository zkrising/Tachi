import { Router, RequestHandler } from "express";
import { UpdateClassIfGreater } from "utils/class";
import { GetUserWithIDGuaranteed } from "utils/user";
import { ParseEA3SoftID } from "utils/ea3id";
import { EXT_HEROIC_VERSE, MODEL_INFINITAS_2, REV_2DXBMS } from "lib/constants/ea3id";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { ParseFervidexStatic } from "lib/score-import/import-types/ir/fervidex-static/parser";
import { ParseFervidexSingle } from "lib/score-import/import-types/ir/fervidex/parser";
import { Playtypes, integer } from "tachi-common";
import CreateLogCtx from "lib/logger/logger";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import { RequirePermissions } from "server/middleware/auth";
import db from "external/mongo/db";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const ValidateFervidexHeader: RequestHandler = (req, res, next) => {
	const agent = req.header("User-Agent");

	if (!agent) {
		logger.debug(
			`Rejected fervidex client with no agent from user ${req[SYMBOL_TachiAPIAuth].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Invalid User-Agent.`,
		});
	}

	if (!agent.startsWith("fervidex/")) {
		logger.info(
			`Rejected fervidex client with invalid agent ${agent} from user ${req[
				SYMBOL_TachiAPIAuth
			].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Invalid User-Agent ${agent} - expected fervidex client.`,
		});
	}

	const versions = agent.split("fervidex/")[1].split(".").map(Number);

	if (!versions.every((e) => !Number.isNaN(e))) {
		logger.info(
			`Rejected fervidex client with agent ${agent} for NaN-like versions from user ${req[
				SYMBOL_TachiAPIAuth
			].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Invalid version ${versions.join(".")}.`,
		});
	}

	// version.minor
	if (versions[1] < 3) {
		logger.debug(
			`Rejected outdated fervidex client from user ${req[SYMBOL_TachiAPIAuth].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Versions of fervidex < 1.3.0 are not supported.`,
		});
	}

	return next();
};

const RequireInf2ModelHeader: RequestHandler = (req, res, next) => {
	const swModel = req.header("X-Software-Model");

	if (!swModel) {
		logger.debug(
			`Rejected empty X-Software-Model from user ${req[SYMBOL_TachiAPIAuth].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Invalid X-Software-Model.`,
		});
	}

	try {
		const softID = ParseEA3SoftID(swModel);

		if (softID.model !== MODEL_INFINITAS_2) {
			logger.debug(`Rejected non-inf2 model from user ${req[SYMBOL_TachiAPIAuth].userID!}.`);
			return res.status(400).send({
				success: false,
				description: "This endpoint is only available for INF2 clients.",
			});
		}
	} catch (err) {
		logger.debug(err);
		return res.status(400).json({
			success: false,
			description: `Invalid X-Software-Model.`,
		});
	}

	return next();
};

const ValidateModelHeader: RequestHandler = (req, res, next) => {
	const swModel = req.header("X-Software-Model");

	if (!swModel) {
		logger.debug(
			`Rejected empty X-Software Model from user ${req[SYMBOL_TachiAPIAuth].userID!}.`
		);
		return res.status(400).json({
			success: false,
			description: `Invalid X-Software-Model.`,
		});
	}

	try {
		const softID = ParseEA3SoftID(swModel);

		if (softID.rev === REV_2DXBMS) {
			return res.status(400).send({
				success: false,
				description: "2DX_BMS is not supported.",
			});
		}

		if (softID.model === MODEL_INFINITAS_2) {
			return next(); // allow anything for inf2.
		}

		if (softID.ext !== EXT_HEROIC_VERSE) {
			logger.info(
				`Rejected invalid Software Model ${softID.ext} from user ${req[SYMBOL_TachiAPIAuth]
					.userID!}.`
			);
			return res.status(400).json({
				success: false,
				description: `Invalid extension ${softID.ext}`,
			});
		}
	} catch (err) {
		logger.debug(err);
		return res.status(400).json({
			success: false,
			description: `Invalid X-Software-Model.`,
		});
	}

	return next();
};

const ValidateCards: RequestHandler = async (req, res, next) => {
	const userID = req[SYMBOL_TachiAPIAuth]!.userID!;

	const cardFilters = await db["fer-settings"].findOne({ userID });

	if (!cardFilters || !cardFilters.cards) {
		return next();
	}

	const cardID = req.header("X-Account-Id");
	if (!cardID) {
		return res.status(400).json({
			success: false,
			description: `Fervidex did not provide a card ID.`,
		});
	}

	if (!cardFilters.cards.includes(cardID)) {
		return res.status(400).json({
			success: false,
			description: `The card ID ${cardID} is not in your list of filters. Ignoring.`,
		});
	}

	return next();
};

router.use(
	RequirePermissions("submit_score"),
	ValidateFervidexHeader,
	ValidateModelHeader,
	ValidateCards
);

/**
 * Submits all of a users data to Kamaitachi. This data is extremely minimal,
 * as only a users Lamp and Score are sent. As such, this is not the prefered
 * way of syncing scores outside of INF2, where there is no other way to
 * retrieve scores.
 *
 * @name POST /ir/fervidex/profile/submit
 */
router.post("/profile/submit", RequireInf2ModelHeader, async (req, res) => {
	const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth].userID!);

	const headers = {
		// guaranteed to exist because of RequireInf2ModelHeader
		model: req.header("X-Software-Model")!,
	};

	const responseData = await ExpressWrappedScoreImportMain(
		userDoc,
		false,
		"ir/fervidex-static",
		(logger) => ParseFervidexStatic(req.body, headers, logger)
	);

	return res.status(responseData.statusCode).json(responseData.body);
});

/**
 * Submits a single score to Kamaitachi. In contrast to profile/submit, this
 * sends the most data (and most accurate data) of any score hook.
 * As such, this is the preferred way of submitting IIDX scores to Kamaitachi.
 *
 * @name POST /ir/fervidex/score/submit
 */
router.post("/score/submit", ValidateModelHeader, async (req, res) => {
	const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth].userID!);

	const model = req.header("X-Software-Model");

	if (!model) {
		return res.status(400).json({
			success: false,
			description: "No X-Software-Model header provided?",
		});
	}

	const headers = {
		model,
	};

	const responseData = await ExpressWrappedScoreImportMain(
		userDoc,
		true,
		"ir/fervidex",
		(logger) => ParseFervidexSingle(req.body, headers, logger)
	);

	return res.status(responseData.statusCode).json(responseData.body);
});

/**
 * Submits the result of a class to Kamaitachi. This contains the dan played
 * and whether it was achieved.
 *
 * @name POST /ir/fervidex/class/submit
 */
router.post("/class/submit", ValidateModelHeader, async (req, res) => {
	if (!req.body.cleared) {
		return res.status(200).json({ success: true, description: "No Update Made.", body: {} });
	}

	if (!Number.isInteger(req.body.course_id)) {
		return res.status(400).json({
			success: false,
			description: `Invalid course_id ${req.body.course_id}.`,
		});
	}

	const courseID = req.body.course_id as integer;

	if (courseID < 0 || courseID > 18) {
		return res.status(400).json({
			success: false,
			description: `Invalid course_id ${req.body.course_id}.`,
		});
	}

	if (req.body.play_style !== 0 && req.body.play_style !== 1) {
		return res.status(400).json({
			success: false,
			description: `Invalid play_style ${req.body.playstyle}`,
		});
	}

	// is 0 or 1.
	const playtype: Playtypes["iidx"] = req.body.play_style === 0 ? "SP" : "DP";

	const r = await UpdateClassIfGreater(
		req[SYMBOL_TachiAPIAuth].userID!,
		"iidx",
		playtype,
		"dan",
		courseID
	);

	return res.status(200).json({
		success: true,
		description: r === false ? "Dan unchanged." : "Dan changed!",
	});
});

export default router;
