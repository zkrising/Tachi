/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import UpdateScore from "lib/score-mutation/update-score";
import type { Migration } from "utils/types";

// old songID -> new songID
const mappings = [
	[2100, 2042],
	[2130, 1997],
	[2142, 2000],
] as const;

// i messed up the last migration, by only updating the chartID and not the song ID.

const migration: Migration = {
	id: "join-inf-casthour-songs",
	up: async () => {
		for (const [oldSongID, newSongID] of mappings) {
			const scores = await db.scores.find({
				songID: oldSongID,
			});

			for (const score of scores) {
				await UpdateScore(score, {
					...score,
					songID: newSongID,
				});
			}
		}
	},
	down: () => {
		throw new Error(`Cannot undo migration.`);
	},
};

export default migration;
