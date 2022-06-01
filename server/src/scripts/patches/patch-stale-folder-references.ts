import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { RemoveStaleFolderShowcaseStats } from "lib/showcase/showcase";
import type { ShowcaseStatFolder } from "tachi-common";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		const folderRefs = await db["game-settings"].find({
			"preferences.stats.mode": "folder",
		});

		const folderIDs = folderRefs
			.map((e) => e.preferences.stats)
			.flat()
			.filter((e) => e.mode === "folder")
			.map((e) => (e as ShowcaseStatFolder).folderID) as Array<string>;

		const pertinentFolders = await db.folders.find(
			{
				folderID: { $in: folderIDs },
			},
			{
				projection: {
					folderID: 1,
				},
			}
		);

		const existingFolders = new Set(pertinentFolders.map((e) => e.folderID));

		const removedFolders = [];

		for (const folderID of folderIDs) {
			if (!existingFolders.has(folderID)) {
				removedFolders.push(folderID);
			}
		}

		if (removedFolders.length === 0) {
			logger.info(`Nothing to remove.`);
			return;
		}

		await RemoveStaleFolderShowcaseStats(removedFolders);
		logger.info(`Removed ${removedFolders.length} stale folder showcase stats.`, {
			removedFolders,
		});
	})().catch((err: unknown) => {
		logger.error(`Failed to patch stale showcase-stat folder references.`, { err });

		process.exit(1);
	});
}
