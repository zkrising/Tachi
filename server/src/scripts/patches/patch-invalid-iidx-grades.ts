import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetGradeFromPercent } from "lib/score-import/framework/common/score-utils";
import UpdateScore from "lib/score-mutation/update-score";
import { GetGamePTConfig } from "tachi-common";

const gradeBoundaries = [
	{ grade: "F", lb: 22.2222, ub: 22.2223 },
	{ grade: "E", lb: 33.3333, ub: 33.3334 },
	{ grade: "D", lb: 44.4444, ub: 44.4445 },
	{ grade: "C", lb: 55.5555, ub: 55.5556 },
	{ grade: "B", lb: 66.6666, ub: 66.6667 },
	{ grade: "A", lb: 77.7777, ub: 77.7778 },
	{ grade: "AA", lb: 88.8888, ub: 88.8889 },
	{ grade: "AAA", lb: 94.4444, ub: 94.4445 },
];

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		for (const { grade, lb, ub } of gradeBoundaries) {
			// eslint-disable-next-line no-await-in-loop
			const scores = await db.scores.find({
				game: "iidx",
				"scoreData.grade": grade,
				"scoreData.percent": {
					$gt: lb,
					$lt: ub,
				},
			});

			logger.info(`Grade=${grade} lb=${lb} ub=${ub} matches ${scores.length} scores.`);

			for (const score of scores) {
				const gptConfig = GetGamePTConfig("iidx", score.playtype);

				const newGrade = GetGradeFromPercent(
					"iidx",
					score.playtype,
					score.scoreData.percent
				);

				const newScore = deepmerge(score, {
					scoreData: {
						grade: newGrade,
						gradeIndex: gptConfig.grades.indexOf(newGrade),
					},
				});

				// eslint-disable-next-line no-await-in-loop
				await UpdateScore(score, newScore);
			}
		}

		logger.info(`Done!`);

		process.exit(0);
	})();
}
