import { Router, RequestHandler } from "express";
import { UpdateClassIfGreater } from "../../../../common/class";
import { GetUserWithIDGuaranteed } from "../../../../common/user";
import { ParseEA3SoftID } from "../../../../common/util";
import { EXT_HEROIC_VERSE, MODEL_INFINITAS_2, REV_2DXBMS } from "../../../../constants/ea3id";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../../score-import/framework/express-wrapper";
import { ParseFervidexStatic } from "../../../../score-import/import-types/ir/fervidex-static/parser";
import { ParseFervidexSingle } from "../../../../score-import/import-types/ir/fervidex/parser";
import { Playtypes } from "kamaitachi-common";
import CreateLogCtx from "../../../../common/logger";
import { FERVIDEX_COURSE_LOOKUP } from "../../../../score-import/import-types/ir/fervidex-static/class-handler";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const ValidateFervidexHeader: RequestHandler = (req, res, next) => {
    const agent = req.header("User-Agent");

    if (!agent) {
        logger.debug(
            `Rejected fervidex client with no agent from user ${req.session.ktchi!.userID}.`
        );
        return res.status(400).json({
            success: false,
            description: `Invalid User-Agent.`,
        });
    }

    if (!agent.startsWith("fervidex/")) {
        logger.info(
            `Rejected fervidex client with invalid agent ${agent} from user ${
                req.session.ktchi!.userID
            }.`
        );
        return res.status(400).json({
            success: false,
            description: `Invalid User-Agent ${agent} - expected fervidex client.`,
        });
    }

    const versions = agent.split("fervidex/")[1].split(".").map(Number);

    if (!versions.every((e) => !Number.isNaN(e))) {
        logger.info(
            `Rejected fervidex client with agent ${agent} for NaN-like versions from user ${
                req.session.ktchi!.userID
            }.`
        );
        return res.status(400).json({
            success: false,
            description: `Invalid version ${versions.join(".")}.`,
        });
    }

    // version.minor
    if (versions[1] < 3) {
        logger.debug(`Rejected outdated fervidex client from user ${req.session.ktchi!.userID}.`);
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
        logger.debug(`Rejected empty X-Software-Model from user ${req.session.ktchi!.userID}.`);
        return res.status(400).json({
            success: false,
            description: `Invalid X-Software-Model.`,
        });
    }

    try {
        const softID = ParseEA3SoftID(swModel);

        if (softID.model !== MODEL_INFINITAS_2) {
            logger.debug(`Rejected non-inf2 model from user ${req.session.ktchi!.userID}.`);
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
        logger.debug(`Rejected empty X-Software Model from user ${req.session.ktchi!.userID}.`);
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
                `Rejected invalid Software Model ${softID.ext} from user ${
                    req.session.ktchi!.userID
                }.`
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

router.use(RequireLoggedIn, ValidateFervidexHeader, ValidateModelHeader);

/**
 * Submits all of a users data to Kamaitachi. This data is extremely minimal,
 * as only a users Lamp and Score are sent. As such, this is not the prefered
 * way of syncing scores outside of INF2, where there is no other way to
 * retrieve scores.
 *
 * @name /api/ir/fervidex/profile/submit
 */
router.post("/profile/submit", RequireInf2ModelHeader, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.ktchi!.userID);

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
 * @name /api/ir/fervidex/score/submit
 */
router.post("/score/submit", ValidateModelHeader, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.ktchi!.userID);

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
 * @name /api/ir/fervidex/class/submit
 */
router.post("/class/submit", ValidateModelHeader, async (req, res) => {
    if (!req.body.cleared) {
        return res.status(200).json({ success: true, description: "No Update Made.", body: {} });
    }

    const classVal = FERVIDEX_COURSE_LOOKUP[req.body.course_id];

    if (!classVal) {
        return res.status(400).json({
            success: false,
            description: `Invalid courseID of ${req.body.course_id}.`,
        });
    }

    // is 0 or 1.
    const playtype: Playtypes["iidx"] = req.body.playstyle ? "SP" : "DP";

    const r = await UpdateClassIfGreater(
        req.session.ktchi!.userID,
        "iidx",
        playtype,
        "dan",
        classVal
    );

    return res.status(200).json({
        success: true,
        description: r === false ? "Dan unchanged." : "Dan changed!",
    });
});

export default router;
