import { Router, RequestHandler } from "express";
import { UpdateClassIfGreater } from "../../../common/class";
import { GetUserWithIDGuaranteed } from "../../../common/user";
import { ParseEA3SoftID } from "../../../common/util";
import { INF2_MODEL, REV_2DXBMS } from "../../../constants/ea3id";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../score-import/framework/express-wrapper";
import { ParseFervidexStatic } from "../../../score-import/import-types/ir/fervidex-static/parser";
import { ParseFervidexSingle } from "../../../score-import/import-types/ir/fervidex/parser";
import { Playtypes } from "kamaitachi-common";

const router: Router = Router({ mergeParams: true });

const RequireInf2ModelHeader: RequestHandler = (req, res, next) => {
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

const ValidateModelHeader: RequestHandler = (req, res, next) => {
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

    if (req.body.sp_dan || req.body.sp_dan === 0) {
        let classVal = FERVIDEX_COURSE_LOOKUP[req.body.sp_dan];

        if (!classVal) {
            return res.status(400).json({
                success: false,
                description: `Invalid courseID of ${req.body.sp_dan}.`,
            });
        }

        await UpdateClassIfGreater(req.session.ktchi!.userID, "iidx", "SP", "dan", classVal);
    }

    if (req.body.dp_dan || req.body.dp_dan === 0) {
        let classVal = FERVIDEX_COURSE_LOOKUP[req.body.dp_dan];

        if (!classVal) {
            return res.status(400).json({
                success: false,
                description: `Invalid courseID of ${req.body.dp_dan}.`,
            });
        }

        await UpdateClassIfGreater(req.session.ktchi!.userID, "iidx", "DP", "dan", classVal);
    }

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

const FERVIDEX_COURSE_LOOKUP = [
    "7kyu",
    "6kyu",
    "5kyu",
    "4kyu",
    "3kyu",
    "2kyu",
    "1kyu",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "chuuden",
    "kaiden",
];

/**
 * Submits the result of a class to Kamaitachi. This contains the dan played
 * and whether it was achieved.
 *
 * @name /api/ir/fervidex/class/submit
 */
router.post("/class/submit", RequireLoggedIn, ValidateModelHeader, async (req, res) => {
    if (!req.body.cleared) {
        return res.status(200).json({ success: true, description: "No Update Made.", body: {} });
    }

    let classVal = FERVIDEX_COURSE_LOOKUP[req.body.course_id];

    if (!classVal) {
        return res.status(400).json({
            success: false,
            description: `Invalid courseID of ${req.body.course_id}.`,
        });
    }

    // is 0 or 1.
    let playtype: Playtypes["iidx"] = req.body.playstyle ? "SP" : "DP";

    let r = await UpdateClassIfGreater(
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
