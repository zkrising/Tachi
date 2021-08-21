import db from "external/mongo/db";

(async () => {
	await db.scores.update(
		{ game: "sdvx", "scoreData.lamp": "ULTIMATE CHAIN" },
		{
			$set: {
				"scoreData.judgements.miss": 0,
			},
		},
		{
			multi: true,
		}
	);

	await db.scores.update(
		{ game: "sdvx", "scoreData.lamp": "PERFECT ULTIMATE CHAIN" },
		{
			$set: {
				"scoreData.judgements.miss": 0,
				"scoreData.judgements.near": 0,
			},
		},
		{
			multi: true,
		}
	);

	process.exit(0);
})();
