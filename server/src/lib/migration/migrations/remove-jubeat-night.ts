import db from "external/mongo/db";
import { DeleteMultipleScores } from "lib/score-mutation/delete-scores";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "remove-jubeat-night",
	up: async () => {
		// copied from database-seeds before they were removed
		// the charts themselves are not guaranteed to be in the db
		// so they have to be hardcoded.
		const nightSongIDs = [
			724, 723, 1026, 1028, 1043, 1030, 1014, 1032, 1013, 1046, 1029, 1031, 1006, 1047, 1018,
			1037, 1008, 1021, 1023, 1035, 1005, 1034, 1036, 1038, 1040, 1025, 1017, 1015, 1011,
			1049, 1027, 1045, 1019, 1016, 1020, 1042, 1009, 1007, 1012, 1010, 1044, 1022, 1004,
			1024, 1039, 1041, 1033, 1048,
		];
		const toDelete = await db.scores.find({
			game: "jubeat",
			songID: { $in: nightSongIDs },
		});

		await DeleteMultipleScores(toDelete);
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
