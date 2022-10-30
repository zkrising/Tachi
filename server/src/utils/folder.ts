import deepmerge from "deepmerge";
import db from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import type { BulkWriteOperation, FilterQuery } from "mongodb";
import type {
	ChartDocument,
	FolderChartLookup,
	FolderDocument,
	Game,
	Grades,
	IDStrings,
	integer,
	Lamps,
	PBScoreDocument,
	Playtype,
	SongDocument,
	TableDocument,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

// overloads!

export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument>,
	getSongs: true
): Promise<{ songs: Array<SongDocument>; charts: Array<ChartDocument> }>;
export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter?: FilterQuery<ChartDocument>,
	getSongs?: false
): Promise<{ charts: Array<ChartDocument> }>;
export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument> = {},
	getSongs = false
): Promise<{ songs?: Array<SongDocument>; charts: Array<ChartDocument> }> {
	let songs: Array<SongDocument> | null = null;
	let charts: Array<ChartDocument>;

	switch (folder.type) {
		case "static": {
			charts = await db.charts[folder.game].find(
				deepmerge(filter, {
					// Specifying playtype is mandatory, don't want to catch other charts.
					playtype: folder.playtype,
					chartID: { $in: folder.data },
				})
			);
			break;
		}

		case "songs": {
			songs = await db.songs[folder.game].find(folder.data);

			charts = await db.charts[folder.game].find(
				deepmerge(filter, {
					playtype: folder.playtype,
					songID: { $in: songs.map((e) => e.id) },
				})
			);
			break;
		}

		case "charts": {
			const folderDataTransposed = TransposeFolderData(folder.data);

			logger.debug(`Transposed folder data in resolve-folder-to-charts.`, {
				folder,
				folderDataTransposed,
			});

			const fx = deepmerge.all([filter, { playtype: folder.playtype }, folderDataTransposed]);

			charts = await db.charts[folder.game].find(fx);
			break;
		}

		default: {
			logger.error(
				`Invalid folder at ${(folder as FolderDocument).folderID}. Cannot resolve.`,
				{ folder }
			);

			throw new Error(
				`Invalid folder ${(folder as FolderDocument).folderID}. Cannot resolve.`
			);
		}
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

/**
 * Replace all ¬'s in key names with ., and all ~'s with $.
 * This is to get around the fact that you cannot store these values in mongo,
 * and we are doing reflective querying.
 */
export function TransposeFolderData(obj: Record<string, unknown>) {
	const transposedObj: Record<string, unknown> = {};

	for (const key of Object.keys(obj)) {
		const transposedKey = key.replace(/~/gu, "$").replace(/¬/gu, ".");

		if (
			typeof obj[key] === "object" &&
			!Array.isArray(obj[key]) &&
			(obj[key] as object | null)
		) {
			transposedObj[transposedKey] = TransposeFolderData(obj[key] as Record<string, unknown>);
		} else {
			transposedObj[transposedKey] = obj[key];
		}
	}

	return transposedObj;
}

export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument>,
	getSongs: true
): Promise<{ songs: Array<SongDocument>; charts: Array<ChartDocument> }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument>,
	getSongs: false
): Promise<{ charts: Array<ChartDocument> }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument> = {},
	getSongs = false
): Promise<{ songs?: Array<SongDocument>; charts: Array<ChartDocument> }> {
	const chartIDs = await GetFolderChartIDs(folder.folderID);

	const charts = await db.charts[folder.game].find(
		deepmerge.all([{ playtype: folder.playtype }, { chartID: { $in: chartIDs } }, filter])
	);

	if (getSongs) {
		const songs = await db.songs[folder.game].find({
			id: { $in: charts.map((e) => e.songID) },
		});

		return { songs, charts };
	}

	return { charts };
}

export async function GetFolderChartIDs(folderID: string) {
	const chartIDs = await db["folder-chart-lookup"].find(
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

export async function CreateFolderChartLookup(folder: FolderDocument, flush = false) {
	try {
		const { charts } = await ResolveFolderToCharts(folder, {}, false);

		if (flush) {
			await db["folder-chart-lookup"].remove({
				folderID: folder.folderID,
			});
		}

		const ops: Array<BulkWriteOperation<FolderChartLookup>> = charts.map((c) => ({
			updateOne: {
				filter: {
					chartID: c.chartID,
					folderID: folder.folderID,
				},

				// amusing no-op
				update: {
					$set: {
						chartID: c.chartID,
						folderID: folder.folderID,
					},
				},
				upsert: true,
			},
		}));

		if (ops.length === 0) {
			return;
		}

		// we do a bulk-upsert here to avoid race conditions if multiple things try to
		// create a folder-chart-lookup at the same time.
		await db["folder-chart-lookup"].bulkWrite(ops);
	} catch (err) {
		logger.error(`Failed to create folder chart lookup for ${folder.title}.`, { folder, err });
		throw err;
	}
}

/**
 * Creates the "folder-chart-lookup" cache. This is used to optimise
 * common use cases, such as retrieving chartIDs from a folder.
 */
export async function InitaliseFolderChartLookup() {
	logger.info(`Started InitialiseFolderChartLookup`);
	await db["folder-chart-lookup"].remove({});
	logger.info(`Flushed Cache.`);

	// temporary hack -- this will still break if we introduce a new
	// playtype on staging or something.
	// We need to have separate seeds for staging and prod! todo #609.
	const folders = await db.folders.find({
		game: { $in: TachiConfig.GAMES },
	});

	logger.info(`Reloading ${folders.length} folders.`);

	await Promise.all(folders.map((folder) => CreateFolderChartLookup(folder)));

	logger.info(`Completed InitialiseFolderChartLookup.`);
}

export async function GetFoldersFromTable(table: TableDocument) {
	const folders = await db.folders.find({
		folderID: { $in: table.folders },
	});

	if (folders.length !== table.folders.length) {
		// this is an error, but we can return anyway.
		logger.warn(
			`Table ${table.tableID} has a mismatch of real folders to stored folders. ${table.folders.length} -> ${folders.length}`
		);
	}

	// we also need to sort folders in their indexed order.
	folders.sort((a, b) => table.folders.indexOf(a.folderID) - table.folders.indexOf(b.folderID));

	return folders;
}

export async function GetPBsOnFolder(userID: integer, folder: FolderDocument) {
	const { charts, songs } = await GetFolderCharts(folder, {}, true);

	const pbs = await db["personal-bests"].find({
		userID,
		chartID: { $in: charts.map((e) => e.chartID) },
	});

	return { pbs, charts, songs };
}

export function CalculateLampDistribution(pbs: Array<PBScoreDocument>) {
	const lampDist: Partial<Record<Lamps[IDStrings], integer>> = {};

	for (const pb of pbs) {
		if (lampDist[pb.scoreData.lamp] !== undefined) {
			lampDist[pb.scoreData.lamp]!++;
		} else {
			lampDist[pb.scoreData.lamp] = 1;
		}
	}

	return lampDist;
}

export function CalculateGradeDistribution(pbs: Array<PBScoreDocument>) {
	const gradeDist: Partial<Record<Grades[IDStrings], integer>> = {};

	for (const pb of pbs) {
		if (gradeDist[pb.scoreData.grade] !== undefined) {
			gradeDist[pb.scoreData.grade]!++;
		} else {
			gradeDist[pb.scoreData.grade] = 1;
		}
	}

	return gradeDist;
}

export async function GetGradeLampDistributionForFolder(userID: integer, folder: FolderDocument) {
	const pbData = await GetPBsOnFolder(userID, folder);

	return {
		grades: CalculateGradeDistribution(pbData.pbs),
		lamps: CalculateLampDistribution(pbData.pbs),
		folderID: folder.folderID,
		chartCount: pbData.charts.length,
	};
}

export function GetGradeLampDistributionForFolders(
	userID: integer,
	folders: Array<FolderDocument>
) {
	return Promise.all(folders.map((f) => GetGradeLampDistributionForFolder(userID, f)));
}

export function CreateFolderID(query: Record<string, unknown>, game: Game, playtype: Playtype) {
	return `F${fjsh.hash({ game, playtype, ...query }, "SHA256")}`;
}

export async function GetRecentlyViewedFolders(userID: integer, game: Game, playtype: Playtype) {
	const views = await db["recent-folder-views"].find(
		{
			userID,
			game,
			playtype,
		},
		{
			sort: {
				lastViewed: -1,
			},
			limit: 6,
		}
	);

	if (views.length === 0) {
		return { views, folders: [] };
	}

	const folders = await db.folders.find({
		folderID: { $in: views.map((e) => e.folderID) },
	});

	return { views, folders };
}
