import { Router } from "express";
import { GetUserWithIDGuaranteed } from "../../../../utils/user";
import { ExpressWrappedScoreImportMain } from "../../../../lib/score-import/framework/express-wrapper";
import ParseDirectManual from "../../../../lib/score-import/import-types/ir/direct-manual/parser";
import { RequirePermissions } from "../../../middleware/auth";
import { SYMBOL_TachiAPIAuth } from "../../../../lib/constants/tachi";

const router: Router = Router({ mergeParams: true });

/**
 * Submits a single score document from Chunitachi clients.
 * @name POST /ir/chunitachi/score/submit
 */
router.post("/import", RequirePermissions("submit_score"), async (req, res) => {
	const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth].userID!);

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
