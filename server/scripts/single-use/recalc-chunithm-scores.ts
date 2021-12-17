import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetGradeFromPercent } from "lib/score-import/framework/common/score-utils";
import UpdateScore from "lib/score-mutation/update-score";
import { ChartDocument, GetGamePTConfig } from "tachi-common";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	let i = 0;
	db.scores
		.find({ game: "chunithm", "scoreData.grade": null })
		// @ts-expect-error dumb
		.each(async (oldScore, { pause, resume }) => {
			pause();

			const chart = (await db.charts.chunithm.findOne({
				chartID: oldScore.chartID,
			})) as ChartDocument<"chunithm:Single">;

			if (!chart) {
				logger.severe(`Chart ${oldScore.chartID} has no chart?`);
				return resume();
			}

			const newScore = JSON.parse(JSON.stringify(oldScore));

			newScore.scoreData.grade = GetGradeFromPercent(
				"chunithm",
				oldScore.playtype,
				oldScore.scoreData.percent
			);

			newScore.scoreData.gradeIndex = GetGamePTConfig(
				"chunithm",
				oldScore.playtype
			).grades.indexOf(newScore.scoreData.grade);

			await UpdateScore(oldScore, newScore);

			i++;

			resume();
		})
		.then(() => {
			logger.info(`Fixed ${i} bad scores.`);
			process.exit(0);
		});
}
