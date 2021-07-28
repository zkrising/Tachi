import { Router } from "express";
import { GetUserWithIDGuaranteed } from "utils/user";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { ParseBarbatosSingle } from "lib/score-import/import-types/ir/barbatos/parser";
import { RequirePermissions } from "server/middleware/auth";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";

const router: Router = Router({ mergeParams: true });

router.use(RequirePermissions("submit_score"));

/**
 * Submits a single score document from Barbatos clients.
 * @name POST /ir/barbatos/score/submit
 */
router.post("/score/submit", async (req, res) => {
	const userDoc = await GetUserWithIDGuaranteed(req[SYMBOL_TachiAPIAuth]!.userID!);

	const responseData = await ExpressWrappedScoreImportMain(
		userDoc,
		false,
		"ir/barbatos",
		(logger) => ParseBarbatosSingle(req.body, logger)
	);

	return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
