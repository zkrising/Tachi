/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetGamePTConfig } from "tachi-common";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import UpdateScore from "lib/score-mutation/update-score";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		const gptConfig = GetGamePTConfig("iidx", "SP");

		for (const [key, grade] of gptConfig.grades.entries()) {
			const badScores = await db.scores.find({
				game: "iidx",
				"scoreData.grade": grade,
				"scoreData.percent": { $lt: gptConfig.gradeBoundaries[key] },
			});

			logger.info(`${grade} (${gptConfig.gradeBoundaries[key]}) ${badScores.length}`);

			for (const badScore of badScores) {
				const chart = await db.charts.iidx.findOne({ chartID: badScore.chartID });

				if (!chart) {
					logger.severe(
						`Couldn't find chart for ${badScore.chartID}, yet scores exist on it?`
					);
					continue;
				}

				const newScore = JSON.parse(JSON.stringify(badScore));

				const { grade } = GenericGetGradeAndPercent(
					"iidx",
					badScore.scoreData.score,
					chart
				);

				newScore.scoreData.grade = grade;
				newScore.scoreData.gradeIndex = gptConfig.grades.indexOf(grade);

				await UpdateScore(badScore, newScore);
			}
		}

		process.exit(0);
	})();
}
