import db from "external/mongo/db";

if (require.main === module) {
	(async () => {
		const badScoreInfos = await db.sessions.find({
			"scoreInfo.isNewScore": false,
			"scoreInfo.scoreDelta": null,
		});

		for (const session of badScoreInfos) {
			const scoreInfo = session.scoreInfo.filter(
				(e) => !(!e.isNewScore && e.scoreDelta === null)
			);

			// eslint-disable-next-line no-await-in-loop
			await db.sessions.update(
				{
					sessionID: session.sessionID,
				},
				{
					$set: {
						scoreInfo,
					},
				}
			);
		}

		process.exit(0);
	})();
}
