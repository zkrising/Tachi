import { RecalcAllScores } from "utils/calculations/recalc-scores";
import type { Migration } from "utils/types";

const migration: Migration = {
	id: "ktRating-to-curator-skill",
	up: async () => {
		await RecalcAllScores({ game: "museca" });
	},
	down: () => {
		throw new Error(`Not possible to revert.`);
	},
};

export default migration;
