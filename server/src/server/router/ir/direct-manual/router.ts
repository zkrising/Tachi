import { Router } from "express";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { MakeScoreImport } from "lib/score-import/framework/score-import";
import { ServerConfig } from "lib/setup/config";
import { RequirePermissions } from "server/middleware/auth";
import { ScoreImportRateLimiter } from "server/middleware/rate-limiter";
import { Random20Hex } from "utils/misc";
import type { ScoreImportJobData } from "lib/score-import/worker/types";

const router: Router = Router({ mergeParams: true });

/**
 * Imports scores in ir/direct-manual form.
 * @name POST /ir/direct-manual/import
 */
router.post(
	"/import",
	RequirePermissions("submit_score"),
	ScoreImportRateLimiter,
	async (req, res) => {
		const userIntent = !!req.header("X-User-Intent");

		if (ServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER) {
			const importID = Random20Hex();

			const job: ScoreImportJobData<"ir/direct-manual"> = {
				importID,
				userID: req[SYMBOL_TACHI_API_AUTH].userID!,
				userIntent,
				importType: "ir/direct-manual",
				parserArguments: [req.safeBody],
			};

			// Fire the score import, but make no guarantees about its state.
			void MakeScoreImport(job);

			return res.status(202).json({
				success: true,
				description:
					"Import loaded into queue. You can poll the provided URL for information on when its complete.",
				body: {
					url: `${ServerConfig.OUR_URL}/api/v1/imports/${importID}/poll-status`,
					importID,
				},
			});
		}

		// Fire the score import and wait for it to finish!
		const importResponse = await ExpressWrappedScoreImportMain<"ir/direct-manual">(
			req[SYMBOL_TACHI_API_AUTH].userID!,
			userIntent,
			"ir/direct-manual",
			[req.safeBody]
		);

		return res.status(importResponse.statusCode).json(importResponse.body);
	}
);

export default router;
