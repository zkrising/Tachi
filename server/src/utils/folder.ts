import {
	Grades,
	Lamps,
	IDStrings,
	TableDocument,
	ChartDocument,
	SongDocument,
	integer,
	PBScoreDocument,
	FolderDocument,
	Playtypes,
	Game,
} from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FilterQuery } from "mongodb";
import deepmerge from "deepmerge";
import fjsh from "fast-json-stable-hash";
import { TachiConfig } from "lib/setup/config";

const logger = CreateLogCtx(__filename);

// overloads!

export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument>,
	getSongs: true
): Promise<{ songs: SongDocument[]; charts: ChartDocument[] }>;
export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter?: FilterQuery<ChartDocument>,
	getSongs?: false
): Promise<{ charts: ChartDocument[] }>;
export async function ResolveFolderToCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument> = {},
	getSongs = false
): Promise<{ songs?: SongDocument[]; charts: ChartDocument[] }> {
	let songs: SongDocument[] | null = null;
	let charts: ChartDocument[];

	if (folder.type === "static") {
		charts = await db.charts[folder.game].find(
			deepmerge(filter, {
				playtype: folder.playtype, // mandatory
				chartID: { $in: folder.data },
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
		const folderDataTransposed = TransposeFolderData(folder.data);

		const fx = deepmerge.all([filter, { playtype: folder.playtype }, folderDataTransposed]);

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

/**
 * Replace all ¬'s in key names with ., and all ~'s with $.
 * This is to get around the fact that you cannot store these values in mongo,
 * and we are doing reflective querying.
 */
export function TransposeFolderData(obj: Record<string, unknown>) {
	const transposedObj: Record<string, unknown> = {};

	for (const key in obj) {
		const transposedKey = key.replace(/~/gu, "$").replace(/¬/gu, ".");

		if (typeof obj[key] === "object" && obj[key]) {
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
): Promise<{ songs: SongDocument[]; charts: ChartDocument[] }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument>,
	getSongs: false
): Promise<{ charts: ChartDocument[] }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<ChartDocument> = {},
	getSongs = false
): Promise<{ songs?: SongDocument[]; charts: ChartDocument[] }> {
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
	const { charts } = await ResolveFolderToCharts(folder, {}, false);

	if (flush) {
		await db["folder-chart-lookup"].remove({
			folderID: folder.folderID,
		});
	}

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

export function CalculateLampDistribution(pbs: PBScoreDocument[]) {
	const lampDist: Partial<Record<Lamps[IDStrings], integer>> = {};

	for (const pb of pbs) {
		if (lampDist[pb.scoreData.lamp]) {
			// @ts-expect-error ???
			lampDist[pb.scoreData.lamp]++;
		} else {
			lampDist[pb.scoreData.lamp] = 1;
		}
	}

	return lampDist;
}

export function CalculateGradeDistribution(pbs: PBScoreDocument[]) {
	const gradeDist: Partial<Record<Grades[IDStrings], integer>> = {};

	for (const pb of pbs) {
		if (gradeDist[pb.scoreData.grade]) {
			// @ts-expect-error ???
			gradeDist[pb.scoreData.grade]++;
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

export function GetGradeLampDistributionForFolders(userID: integer, folders: FolderDocument[]) {
	return Promise.all(folders.map((f) => GetGradeLampDistributionForFolder(userID, f)));
}

export function CreateFolderID(
	query: Record<string, unknown>,
	game: Game,
	playtype: Playtypes[Game]
) {
	return `F${fjsh.hash(Object.assign({ game, playtype }, query), "SHA256")}`;
}

export async function GetRecentlyViewedFolders(
	userID: integer,
	game: Game,
	playtype: Playtypes[Game]
) {
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
