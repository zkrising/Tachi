import { Router } from "express";
import { GetUserWithIDGuaranteed } from "../../../../utils/user";
import { RequireLoggedInSession } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import ParseDirectManual from "../../../../lib/score-import/import-types/ir/direct-manual/parser";
import { SYMBOL_TachiAPIAuth } from "../../../../lib/constants/tachi";
import { RequirePermissions } from "../../../middleware/auth";

const router: Router = Router({ mergeParams: true });

/**
 * Imports scores in ir/json:direct-manual form.
 * @name POST /ir/direct-manual/import
 */
router.post(
    "/import",
    RequirePermissions("submit:score"),
    RequireLoggedInSession,
    async (req, res) => {
        const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth].userID!);

        const intent = req.header("X-User-Intent");

        const responseData = await ExpressWrappedScoreImportMain(
            userDoc,
            !!intent,
            "ir/direct-manual",
            (logger) => ParseDirectManual(req.body, logger)
        );

        return res.status(responseData.statusCode).json(responseData.body);
    }
);

export default router;
