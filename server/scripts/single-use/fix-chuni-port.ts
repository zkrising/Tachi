import db from "external/mongo/db";

(async () => {
	const charts = await db.charts.chunithm.find({});

	for (const c of charts) {
		await db.charts.chunithm.update(
			{
				_id: c._id,
			},
			{
				$set: {
					"data.inGameID": c.songID,
				},
			}
		);
	}
})();
