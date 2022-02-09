import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

async function DedupeScoreIDs() {
	const dups = await db.scores.aggregate(
		[
			{
				$group: {
					_id: "$scoreID",
					dups: { $addToSet: "$_id" },
					count: { $sum: 1 },
				},
			},
			{
				$match: {
					count: { $gt: 1 },
				},
			},
		],
		{ allowDiskUse: true }
	);

	logger.info(`Found ${dups.length} dups.`);

	for (const dup of dups) {
		dup.dups.shift();
		await db.scores.remove({ _id: { $in: dup.dups } });
	}

	logger.info(`Done.`);
	process.exit(0);
}

DedupeScoreIDs();
