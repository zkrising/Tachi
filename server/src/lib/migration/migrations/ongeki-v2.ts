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

						if ("break" in newScore.scoreData.judgements) {
							newScore.scoreData.judgements = {
								...newScore.scoreData.judgements,
								rbreak: newScore.scoreData.judgements.break as number,
							};
							delete (newScore.scoreData.judgements as any).break;
						}

						if ("platScore" in newScore.scoreData.optional) {
							newScore.scoreData.platinumScore = newScore.scoreData.optional
								.platScore as number;
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
