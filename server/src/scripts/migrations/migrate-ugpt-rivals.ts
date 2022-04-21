import db from "external/mongo/db";

if (require.main === module) {
	(async () => {
		// give everyone empty rivals.
		await db["game-settings"].update(
			{},
			{
				$set: {
					rivals: [],
				},
			}
		);
	})();
}
