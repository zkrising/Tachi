import db from "external/mongo/db";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

/**
 * The tachi-server may have its BMS database update. It needs to sync this
 * information back with the seeds.
 */
export async function BacksyncBMSSongsAndCharts() {
	const repo = await PullDatabaseSeeds();

	logger.info(`Fetching BMS songs from DB.`);
	// did you know, this is liable to blow up in my face and OOM one day?
	let bmsSongs = await db.songs.bms.find({});

	logger.info(`Found ${bmsSongs.length} bms songs.`);

	await repo.WriteCollection("songs-bms", bmsSongs);

	// @ts-expect-error This is obviously making something nullable when it shouldn't be.
	// but if we don't *force* node to free this damn memory, it kills itself when it
	// tries to read even more stuff.
	bmsSongs = null;

	logger.info(`Fetching BMS charts from DB.`);
	let bmsCharts = await db.charts.bms.find({});

	logger.info(`Found ${bmsCharts.length} bms charts.`);

	await repo.WriteCollection("charts-bms", bmsCharts);

	// @ts-expect-error See previous expect-error.
	bmsCharts = null;

	await repo.CommitChangesBack(`Backsync BMS Songs/Charts ${new Date().toISOString()}`);
}

if (require.main === module) {
	BacksyncBMSSongsAndCharts().then(() => process.exit(0));
}
