import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateCalculatedData } from "lib/score-import/framework/calculated-data/calculated-data";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { updateLanguageServiceSourceFile } from "typescript";
import { EfficientDBIterate } from "../../util/efficient-db-iterate";
import { UpdateAllPBs } from "./update-all-pbs";

const logger = CreateLogCtx(__filename);

export async function RecalcAllScores(filter = {}) {
	logger.info(`Recalcing All Scores.`);

	await EfficientDBIterate(
		db.scores,
		async (c) => {
			const chart = await db.charts[c.game].findOne({ chartID: c.chartID });

			if (!chart) {
				logger.error(`Can't find chartID ${c.chartID} ${c.scoreID} (${c.game})`, {
					score: c,
				});

				throw new Error(`screwed`);
			}
			const calculatedData = await CreateCalculatedData(c, chart, c.scoreData.esd, logger);

			return { scoreID: c.scoreID, calculatedData };
		},
		async (updates) => {
			await db.scores.bulkWrite(
				updates.map((e) => ({
					updateOne: {
						filter: {
							scoreID: e.scoreID,
						},
						update: {
							$set: {
								calculatedData: e.calculatedData,
							},
						},
					},
				}))
			);
		},
		filter
	);

	logger.info("Reprocessing PBs...");
	await UpdateAllPBs(filter);

	logger.info(`Done!`);
}

if (require.main === module) {
	RecalcAllScores();
}
