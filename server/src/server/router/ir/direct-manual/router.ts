import { Router } from "express";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { MakeScoreImport } from "lib/score-import/framework/score-import";
import { ScoreImportJobData } from "lib/score-import/worker/types";
import { ServerConfig } from "lib/setup/config";
import { RequirePermissions } from "server/middleware/auth";
import { Random20Hex } from "utils/misc";

const router: Router = Router({ mergeParams: true });

/**
 * Imports scores in ir/json:direct-manual form.
 * @name POST /ir/direct-manual/import
 */
router.post("/import", RequirePermissions("submit_score"), async (req, res) => {
	const userIntent = !!req.header("X-User-Intent");

	if (ServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER) {
		const importID = Random20Hex();

		const job: ScoreImportJobData<"ir/direct-manual"> = {
			importID,
			userID: req[SYMBOL_TachiAPIAuth].userID!,
			userIntent,
			importType: "ir/direct-manual",
			parserArguments: [req.body],
		};

		// Fire the score import, but make no guarantees about its state.
		MakeScoreImport(job);

		return res.status(202).json({
			success: true,
			description:
				"Import loaded into queue. You can poll the provided URL for information on when its complete.",
			body: {
				url: `${ServerConfig.OUR_URL}/api/v1/imports/${importID}/poll-status`,
				importID,
			},
		});
	} else {
		// Fire the score import and wait for it to finish!
		const importResponse = await ExpressWrappedScoreImportMain<"ir/direct-manual">(
			req[SYMBOL_TachiAPIAuth].userID!,
			userIntent,
			"ir/direct-manual",
			[req.body]
		);

		return res.status(importResponse.statusCode).json(importResponse.body);
	}
});

export default router;
