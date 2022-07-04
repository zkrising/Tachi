import CreateLogCtx from "lib/logger/logger";
import { RecalcAllScores } from "utils/calculations/recalc-scores";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	RecalcAllScores()
		.then(() => {
			logger.info(`Successfully recalced all scores.`, () => {
				process.exit(0);
			});
		})
		.catch((err: unknown) => {
			logger.error(`Failed to recalc all scores.`, { err }, () => {
				process.exit(1);
			});
		});
}
