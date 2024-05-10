/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "rm-hot",
	up: async () => {
		const toRemove = [
			["gitadora", "skill"],
			["wacca", "rate"],
			["maimai", "rate"],
			["maimaidx", "rate"],
		] as const;

		for (const [game, met] of toRemove) {
			await db["game-settings"].update(
				{
					game,
					"preferences.preferredProfileAlg": met,
				},
				{
					$set: {
						"preferences.preferredProfileAlg": null,
					},
				},
				{ multi: true }
			);

			await db["game-stats"].update(
				{ game },
				{
					$unset: { [`ratings.${met}`]: 1 },
				},
				{ multi: true }
			);
			await db["game-stats-snapshots"].update(
				{ game },
				{
					$unset: { [`ratings.${met}`]: 1, [`rankings.${met}`]: 1 },
				},
				{ multi: true }
			);
		}
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
