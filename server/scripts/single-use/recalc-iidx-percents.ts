import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetGradeFromPercent } from "lib/score-import/framework/common/score-utils";
import UpdateScore from "lib/score-mutation/update-score";
import { ChartDocument, GetGamePTConfig } from "tachi-common";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		let i = 0;
		db.scores
			.find({ game: "iidx" })
			// @ts-expect-error dumb
			.each(async (oldScore, { pause, resume }) => {
				pause();

				const chart = (await db.charts.iidx.findOne({
					chartID: oldScore.chartID,
				})) as ChartDocument<"iidx:SP">;

				if (!chart) {
					logger.severe(`Chart ${oldScore.chartID} has no chart?`);
					return resume();
				}

				const percent = (100 * oldScore.scoreData.score) / (chart.data.notecount * 2);
				if (Math.abs(percent - oldScore.scoreData.percent) > 0.00001) {
					const newScore = JSON.parse(JSON.stringify(oldScore));

					newScore.scoreData.percent = percent;
					newScore.scoreData.grade = GetGradeFromPercent(
						"iidx",
						oldScore.playtype,
						percent
					);
					newScore.scoreData.gradeIndex = GetGamePTConfig(
						"iidx",
						oldScore.playtype
					).grades.indexOf(newScore.scoreData.grade);

					await UpdateScore(oldScore, newScore);

					i++;
				}

				resume();
			})
			.then(() => logger.info(`Fixed ${i} bad scores.`));
	})();
}
