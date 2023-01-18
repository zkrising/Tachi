import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import UpdateScore from "lib/score-mutation/update-score";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { EfficientDBIterate } from "utils/efficient-db-iterate";

/**
 * Effectively, rerun CalculateData and DeriveMetrics on all scores.
 */
async function main() {
	const logger = CreateLogCtx(__filename);

	await EfficientDBIterate(
		db.scores,
		async (score) => {
			// @ts-expect-error just incase
			delete score._id;

			try {
				await UpdateScore(
					score,
					// although this seems like a no-op, this actually results
					// in a safe re-derivation of the existing score.
					score,
					undefined,
					true // skipUpdatingPBs because we'll do it after
					// all scores are guaranteeably correct.
				);
			} catch (err) {
				logger.warn(err);
				logger.warn("Continuing through the error.");
			}
		},
		// no-op
		// eslint-disable-next-line @typescript-eslint/require-await
		async () => void 0,
		{},
		10000
	);

	await UpdateAllPBs();
}

if (require.main === module) {
	void main().then(() => process.exit(0));
}
