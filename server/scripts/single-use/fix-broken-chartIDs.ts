import db from "external/mongo/db";
import { Random20Hex } from "utils/misc";

(async () => {
	const docs = await db.charts.iidx.find({ version: "inf" }, { projectID: true });

	for (const doc of docs) {
		await db.charts.iidx.update(
			{
				_id: doc._id,
			},
			{
				$set: {
					chartID: Random20Hex(),
				},
			}
		);
	}

	console.log("done");
})();
