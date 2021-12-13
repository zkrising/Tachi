import { Router } from "express";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { RequirePermissions } from "server/middleware/auth";

const router: Router = Router({ mergeParams: true });

router.use(RequirePermissions("submit_score"));

/**
 * Import a score with the LR2Hook Format.
 *
 * @name POST /ir/lr2hook/import
 */
router.post("/import", async (req, res) => {
	const importRes = await ExpressWrappedScoreImportMain(
		req[SYMBOL_TachiAPIAuth].userID!,
		false,
		"ir/lr2hook",
		[req.body]
	);

	return res.status(importRes.statusCode).json(importRes.body);
});

export default router;
