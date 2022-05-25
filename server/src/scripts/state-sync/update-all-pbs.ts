/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	UpdateAllPBs()
		.then(() => {
			logger.info(`Successfully updated all PBs.`);
			process.exit(0);
		})
		.catch((err: unknown) => {
			logger.error(`Failed to update all PBs.`, { err });
			process.exit(1);
		});
}
