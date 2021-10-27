import db from "external/mongo/db";

if (require.main === module) {
	(async () => {
		const ugs = await db["user-goals"].find(
			{},
			{
				projectID: true,
			}
		);

		for (const ug of ugs) {
			await db["user-goals"].update(
				{
					_id: ug._id,
				},
				{
					$set: {
						progressHuman: ug.progressHuman.toString(),
						outOfHuman: ug.outOfHuman.toString(),
						lastInteraction: null,
					},
					$unset: {
						note: 1,
					},
				}
			);
		}

		process.exit(0);
	})();
}
