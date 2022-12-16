import db from "external/mongo/db";
import UpdateScore from "lib/score-mutation/update-score";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import { FloorToNDP } from "utils/misc";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "jubeat-musicrate-1dp",
	up: async () => {
		await EfficientDBIterate(
			db.scores,
			async (oldScore) => {
				const newScore = {
					...oldScore,
					scoreData: {
						...oldScore.scoreData,
						percent: FloorToNDP(oldScore.scoreData.percent, 1),
					},
				};

				// migrate the score in the callback function.
				await UpdateScore(oldScore, newScore);
			},

			// we don't need to save this back in the database, UpdateScore
			// already handles that.
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => void 0,
			{ game: "jubeat" },
			1000
		);
	},
	down: () => {
		throw new Error(`Cannot undo migration.`);
	},
};

export default migration;
