import db from "external/mongo/db";
import { rootLogger } from "lib/logger/logger";
import UpdateScore from "lib/score-mutation/update-score";
import { ONGEKI_NOTE_LAMPS, type ScoreDocument } from "tachi-common";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "ongeki-v2",
	up: async () => {
		const failedScores = [];

		await EfficientDBIterate(
			db.scores,
			(score) => {
				return score as ScoreDocument<"ongeki:Single">;
			},
			async (scores: Array<ScoreDocument<"ongeki:Single">>) => {
				for (const score of scores) {
					try {
						const newScore = {
							...score,
						};

						if (newScore.scoreData.score === 1010000) {
							newScore.scoreData.noteLamp = "ALL BREAK+";
							newScore.scoreData.enumIndexes.noteLamp =
								ONGEKI_NOTE_LAMPS.ALL_BREAK_PLUS;
						}

						if (
							"platScore" in newScore.scoreData.optional &&
							typeof newScore.scoreData.optional.platScore === "number"
						) {
							newScore.scoreData.platinumScore =
								newScore.scoreData.optional.platScore;
							delete newScore.scoreData.optional.platScore;
						} else {
							newScore.scoreData.platinumScore = 0;
						}

						await UpdateScore(score, newScore);
					} catch (err) {
						rootLogger.warn(err);
						rootLogger.warn("Continuing through the error.");

						failedScores.push(score.scoreID);
					}
				}
			},
			{ game: "ongeki" }
		);
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
