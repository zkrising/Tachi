// Attempt to deoprhan lost scores.

import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ReprocessOrphan } from "lib/score-import/framework/orphans/orphans";

const logger = CreateLogCtx(__dirname);

export async function DeoprhanScores() {
	const orphans = await db["orphan-scores"].find({});

	// ScoreIDs are essentially userID dependent, so this is fine.
	const blacklist = (await db["score-blacklist"].find({})).map((e) => e.scoreID);

	logger.info(`Found ${orphans.length} orphans.`);

	let failed = 0;
	let success = 0;
	let removed = 0;

	await Promise.all(
		orphans.map((or) =>
			ReprocessOrphan(or, blacklist, logger).then((r) => {
				if (r === null) {
					removed++;
				} else if (r === false) {
					failed++;
				} else {
					success++;
				}
			})
		)
	);

	logger.info(`Finished attempting deorphaning.`);

	logger.info(`Success: ${success} | Failed ${failed} | Removed ${removed}.`);
}

if (require.main === module) {
	DeoprhanScores().then(() => {
		process.exit(0);
	});
}
