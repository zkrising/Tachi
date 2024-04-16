/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { VERSION_INFO } from "lib/constants/version";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import { WrapScriptPromise } from "utils/misc";

const logger = CreateLogCtx(__filename);

/**
 * The tachi-server may have its BMS or PMS database update. It needs to sync this
 * information back with the seeds.
 */
export async function BacksyncBMSPMSSongsAndCharts() {
	for (const branch of ["main"]) {
		const repo = await PullDatabaseSeeds(undefined, branch);

		for (const game of ["bms", "pms"] as const) {
			logger.info(`Fetching ${game} songs from DB.`);

			// did you know, this code is liable to blow up in my face and OOM one day?
			let songs = await db.anySongs[game].find({});

			logger.info(`Found ${songs.length} ${game} songs.`);

			await repo.WriteCollection(`songs-${game}`, songs);

			// @ts-expect-error This is obviously making something nullable when it shouldn't be.
			// but if we don't *force* node to free this damn memory, it kills itself when it
			// tries to read even more stuff.
			songs = null;

			logger.info(`Fetching ${game} charts from DB.`);
			let charts = await db.anyCharts[game].find({});

			logger.info(`Found ${charts.length} ${game} charts.`);

			await repo.WriteCollection(`charts-${game}`, charts);

			// @ts-expect-error See previous expect-error.
			charts = null;
		}

		await repo.CommitChangesBack(`Backsync BMS+PMS Songs/Charts ${new Date().toISOString()}`);

		await repo.Destroy();
	}
}

if (require.main === module) {
	WrapScriptPromise(BacksyncBMSPMSSongsAndCharts(), logger);
}
