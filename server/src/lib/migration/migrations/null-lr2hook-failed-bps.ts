import db from "external/mongo/db";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "null-lr2hook-failed-bps",
	up: async () => {
		await db.scores.update(
			{
				importType: "ir/lr2hook",
				"scoreMeta.gauge": "HARD",
				lamp: { $in: ["FAILED", "NO PLAY"] },
			},
			{
				$set: {
					"scoreData.hitMeta.bp": null,
				},
			},
			{
				multi: true,
			}
		);

		await UpdateAllPBs(undefined, { game: "bms" });
	},
	down: () => {
		throw new Error(`Unable to revert transaction, some scores may have been nulled.`);
	},
};

export default migration;
