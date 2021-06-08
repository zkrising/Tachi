import { Router } from "express";
import { GetUserWithIDGuaranteed } from "../../../../utils/user";
import { RequireLoggedIn } from "../../../middleware/require-logged-in";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import ParseDirectManual from "../../../../lib/score-import/import-types/ir/direct-manual/parser";

const router: Router = Router({ mergeParams: true });

/**
 * Submits a single score document from Chunitachi clients.
 * @name POST /ir/chunitachi/score/submit
 */
router.post("/import", RequireLoggedIn, async (req, res) => {
    const userDoc = await GetUserWithIDGuaranteed(req.session.tachi!.userID);

    if (req.body?.head?.game !== "chunithm") {
        return res.status(400).json({
            success: false,
            description: "Invalid Game.",
        });
    }

    if (req.body.head.service !== "Chunitachi") {
        return res.status(400).json({
            success: false,
            description: `Unexpected service ${req.body.head.service} -- expected 'Chunitachi'`,
        });
    }

    const responseData = await ExpressWrappedScoreImportMain(
        userDoc,
        false,
        "ir/chunitachi",
        (logger) => ParseDirectManual(req.body, logger)
    );

    return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
