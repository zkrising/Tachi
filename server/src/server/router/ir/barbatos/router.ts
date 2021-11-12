import { Router } from "express";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { RequirePermissions } from "server/middleware/auth";

const router: Router = Router({ mergeParams: true });

router.use(RequirePermissions("submit_score"));

/**
 * Submits a single score document from Barbatos clients.
 * @name POST /ir/barbatos/score/submit
 */
router.post("/score/submit", async (req, res) => {
	const responseData = await ExpressWrappedScoreImportMain(
		req[SYMBOL_TachiAPIAuth]!.userID!,
		false,
		"ir/barbatos",
		[req.body]
	);

	return res.status(responseData.statusCode).json(responseData.body);
});

export default router;
