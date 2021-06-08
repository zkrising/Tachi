import { Router } from "express";
import { GetUserWithIDGuaranteed } from "../../../../utils/user";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import { ParseBarbatosSingle } from "../../../../lib/score-import/import-types/ir/barbatos/parser";

const router: Router = Router({ mergeParams: true });

/**
 * Submits a single score document from Barbatos clients.
 * @name POST /ir/barbatos/score/submit
 */
router.post("/score/submit", RequireLoggedIn, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.tachi!.userID);

    const responseData = await ExpressWrappedScoreImportMain(
        userDoc,
        false,
        "ir/barbatos",
        (logger) => ParseBarbatosSingle(req.body, logger)
    );

    return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
