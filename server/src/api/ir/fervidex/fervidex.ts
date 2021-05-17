import { Router, RequestHandler } from "express";
import { GetUserWithIDGuaranteed } from "../../../common/user";
import { ParseEA3SoftID } from "../../../common/util";
import { IIDX_AC_MODEL, INF2_MODEL, REV_2DXBMS } from "../../../constants/ea3id";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../score-import/framework/express-wrapper";
import { ParseFervidexStatic } from "../../../score-import/import-types/ir/fervidex-static/parser";
import { ParseFervidexSingle } from "../../../score-import/import-types/ir/fervidex/parser";

const router: Router = Router({ mergeParams: true });

const RequireInf2ModelHeader: RequestHandler = async (req, res, next) => {
    let swModel = req.header("X-Software-Model");

    if (!swModel) {
        return res.status(400).json({
            success: false,
            description: `Invalid X-Software-Model.`,
        });
    }

    try {
        let softID = ParseEA3SoftID(swModel);

        if (softID.model !== INF2_MODEL) {
            return res.status(400).send({
                success: false,
                description: "This endpoint is only available for INF2 clients.",
            });
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            description: `Invalid X-Software-Model.`,
        });
    }

    return next();
};

const ValidateModelHeader: RequestHandler = async (req, res, next) => {
    let swModel = req.header("X-Software-Model");

    if (!swModel) {
        return res.status(400).json({
            success: false,
            description: `Invalid X-Software-Model.`,
        });
    }

    try {
        let softID = ParseEA3SoftID(swModel);

        if (softID.rev !== REV_2DXBMS) {
            return res.status(400).send({
                success: false,
                description: "2DX_BMS is not supported.",
            });
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            description: `Invalid X-Software-Model.`,
        });
    }

    return next();
};

/**
 * Submits all of a users data to Kamaitachi. This data is extremely minimal,
 * as only a users Lamp and Score are sent. As such, this is not the prefered
 * way of syncing scores outside of INF2, where there is no other way to
 * retrieve scores.
 *
 * @name /api/ir/fervidex/profile/submit
 */
router.post("/profile/submit", RequireLoggedIn, RequireInf2ModelHeader, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.ktchi!.userID);

    let headers = {
        // guaranteed to exist because of RequireInf2ModelHeader
        model: req.header("X-Software-Model")!,
    };

    let responseData = await ExpressWrappedScoreImportMain(
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
router.post("/score/submit", RequireLoggedIn, ValidateModelHeader, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.ktchi!.userID);

    let model = req.header("X-Software-Model");

    if (!model) {
        return res.status(400).json({
            success: false,
            description: "No X-Software-Model header provided?",
        });
    }

    let headers = {
        model,
    };

    let responseData = await ExpressWrappedScoreImportMain(userDoc, true, "ir/fervidex", (logger) =>
        ParseFervidexSingle(req.body, headers, logger)
    );

    return res.status(responseData.statusCode).json(responseData.body);
});

/**
 * Submits the result of a class to Kamaitachi. This contains the dan played
 * and whether it was achieved.
 *
 * @name /api/ir/fervidex/class/submit
 */
router.post("/class/submit", RequireLoggedIn, ValidateModelHeader, async (req, res) => {
    if (!req.body.cleared) {
        return res.status(200).json({ success: true, description: "No Update Made", body: {} });
    }

    throw new Error("Unimplemented.");
});

export default router;
