import db from "../../src/db/db";
import CreateLogCtx from "../../src/logger";
import { CreateFolderChartLookup } from "../../src/core/folder-core";

const logger = CreateLogCtx("folder-cache.ts");

/**
 * Creates the "folder-chart-lookup" cache. This is used to optimise
 * common use cases, such as retrieving chartIDs from a folder.
 */
export async function InitaliseFolderChartLookup() {
    logger.info(`Started InitialiseFolderChartLookup`);
    await db["folder-chart-lookup"].remove({});
    logger.info(`Flushed Cache.`);

    let folders = await db.folders.find({});
    logger.info(`Reloading ${folders.length} folders.`);

    await Promise.all(folders.map(CreateFolderChartLookup));

    logger.info(`Completed InitialiseFolderChartLookup.`);
}

InitaliseFolderChartLookup();
