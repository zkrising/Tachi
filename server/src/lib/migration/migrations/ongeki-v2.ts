import db from "external/mongo/db";
import type { Migration } from "utils/types";

const applyScoreAndPb = async (p1: any, p2: any) => {
	await db.scores.update(p1, p2, { multi: true });
	await db["personal-bests"].update(p1, p2, { multi: true });
};

const migration: Migration = {
	id: "ongeki-v2",
	up: async () => {
		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.score": 1010000 }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK+",
					"scoreData.enumIndexes.noteLamp": 4,
				},
			}
		);

		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.judgements.break": { $exists: true } }] },
			{
				$rename: {
					"scoreData.judgements.break": "scoreData.judgements.rbreak",
				},
			}
		);

		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.optional.platScore": { $exists: true } }] },
			{
				$rename: {
					"scoreData.optional.platScore": "scoreData.platinumScore",
				},
			}
		);
	},
	down: async () => {
		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.noteLamp": "ALL BREAK+" }] },
			{
				$set: {
					"scoreData.noteLamp": "ALL BREAK",
					"scoreData.enumIndexes.noteLamp": 3,
				},
			}
		);

		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.judgements.rbreak": { $exists: true } }] },
			{
				$rename: {
					"scoreData.judgements.rbreak": "scoreData.judgements.break",
				},
			}
		);

		await applyScoreAndPb(
			{ $and: [{ game: "ongeki" }, { "scoreData.platinumScore": { $exists: true } }] },
			{
				$rename: {
					"scoreData.platinumScore": "scoreData.optional.platScore",
				},
			}
		);
	},
};

export default migration;
