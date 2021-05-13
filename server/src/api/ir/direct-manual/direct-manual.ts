import { Router } from "express";
import { GetUserWithID } from "../../../core/user-core";
import CreateLogCtx from "../../../logger";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../score-import/framework/express-wrapper";
import ParseDirectManual from "../../../score-import/import-types/ir/direct-manual/parser";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx("direct-manual.ts");

/**
 * Imports scores in ir/json:direct-manual form.
 * @name /api/ir/direct-manual/import
 */
router.post("/import", RequireLoggedIn, async (req, res) => {
    const userDoc = await GetUserWithID(req.session.ktchi!.userID);

    if (!userDoc) {
        logger.severe(
            `User ${req.session.ktchi!.userID} does not have an associated user document.`
        );
        return res.status(500).json({
            success: false,
            description: "An internal error has occured.",
        });
    }

    let responseData = await ExpressWrappedScoreImportMain(
        userDoc,
        true,
        "ir/json:direct-manual",
        (logger) => ParseDirectManual(req.body, logger)
    );

    return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
