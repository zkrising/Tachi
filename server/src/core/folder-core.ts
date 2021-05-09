import db from "../db/db";
import CreateLogCtx from "../logger";
import { FolderDocument, AnyChartDocument, AnySongDocument } from "kamaitachi-common";
import { FilterQuery } from "mongodb";
import deepmerge from "deepmerge";

const logger = CreateLogCtx("folder-core.ts");

// overloads!

export async function ResolveFolderToCharts(
    folder: FolderDocument,
    filter: FilterQuery<AnyChartDocument>,
    getSongs: true
): Promise<{ songs: AnySongDocument[]; charts: AnyChartDocument[] }>;
export async function ResolveFolderToCharts(
    folder: FolderDocument,
    filter?: FilterQuery<AnyChartDocument>,
    getSongs?: false
): Promise<{ charts: AnyChartDocument[] }>;
export async function ResolveFolderToCharts(
    folder: FolderDocument,
    filter: FilterQuery<AnyChartDocument> = {},
    getSongs = false
): Promise<{ songs?: AnySongDocument[]; charts: AnyChartDocument[] }> {
    let songs: AnySongDocument[] | null = null;
    let charts: AnyChartDocument[];

    if (folder.type === "static") {
        charts = await db.charts[folder.game].find(
            deepmerge(filter, {
                playtype: folder.playtype, // mandatory
                chartID: { $in: folder.data }, // @todo
            })
        );
    } else if (folder.type === "songs") {
        songs = await db.songs[folder.game].find(folder.data);

        charts = await db.charts[folder.game].find(
            deepmerge(filter, {
                playtype: folder.playtype,
                songID: { $in: songs.map((e) => e.id) },
            })
        );
    } else if (folder.type === "charts") {
        let folderDataTransposed: Record<string, unknown> = {};

        for (const key in folder.data) {
            folderDataTransposed[key.replace(/¬/gu, ".")] = folder.data[key];
        }

        let fx = deepmerge.all([filter, { playtype: folder.playtype }, folderDataTransposed]);

        charts = await db.charts[folder.game].find(fx);
    } else {
        // @ts-expect-error This is already a weird scenario. Shouldn't fail, though.
        logger.error(`Invalid folder at ${folder.folderID}. Cannot resolve.`, { folder });

        // @ts-expect-error See above
        throw new Error(`Invalid folder ${folder.folderID}. Cannot resolve.`);
    }

    if (getSongs) {
        if (songs) {
            return { songs, charts };
        }

        songs = await db.songs[folder.game].find({
            id: { $in: charts.map((e) => e.songID) },
        });

        return { songs, charts };
    }

    return { charts };
}

export async function GetFolderCharts(
    folder: FolderDocument,
    filter: FilterQuery<AnyChartDocument>,
    getSongs: true
): Promise<{ songs: AnySongDocument[]; charts: AnyChartDocument[] }>;
export async function GetFolderCharts(
    folder: FolderDocument,
    filter: FilterQuery<AnyChartDocument>,
    getSongs?: false
): Promise<{ charts: AnyChartDocument[] }>;
export async function GetFolderCharts(
    folder: FolderDocument,
    filter: FilterQuery<AnyChartDocument> = {},
    getSongs = false
): Promise<{ songs?: AnySongDocument[]; charts: AnyChartDocument[] }> {
    let chartIDs = await GetFolderChartIDs(folder.folderID);

    let charts = await db.charts[folder.game].find(
        deepmerge.all([{ playtype: folder.playtype }, { chartID: { $in: chartIDs } }, filter])
    );

    if (getSongs) {
        let songs = await db.songs[folder.game].find({
            id: { $in: charts.map((e) => e.songID) },
        });

        return { songs, charts };
    }

    return { charts };
}

export async function GetFolderChartIDs(folderID: string) {
    let chartIDs = await db["folder-chart-lookup"].find(
        {
            folderID,
        },
        {
            projection: {
                chartID: 1,
            },
        }
    );

    return chartIDs.map((e) => e.chartID);
}
export async function CreateFolderChartLookup(folder: FolderDocument) {
    let { charts } = await ResolveFolderToCharts(folder, {}, false);

    await db["folder-chart-lookup"].insert(
        charts.map((c) => ({
            folderID: folder.folderID,
            chartID: c.chartID,
        }))
    );
}

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
