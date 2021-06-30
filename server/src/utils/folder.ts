import {
	Grades,
	Lamps,
	IDStrings,
	TableDocument,
	AnyChartDocument,
	AnySongDocument,
	integer,
	PBScoreDocument,
	FolderDocument,
} from "tachi-common";
import db from "../external/mongo/db";
import CreateLogCtx from "../lib/logger/logger";
import { FilterQuery } from "mongodb";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

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
		const folderDataTransposed: Record<string, unknown> = {};

		for (const key in folder.data) {
			folderDataTransposed[key.replace(/¬/gu, ".")] = folder.data[key];
		}

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

export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<AnyChartDocument>,
	getSongs: true
): Promise<{ songs: AnySongDocument[]; charts: AnyChartDocument[] }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<AnyChartDocument>,
	getSongs: false
): Promise<{ charts: AnyChartDocument[] }>;
export async function GetFolderCharts(
	folder: FolderDocument,
	filter: FilterQuery<AnyChartDocument> = {},
	getSongs = false
): Promise<{ songs?: AnySongDocument[]; charts: AnyChartDocument[] }> {
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
export async function CreateFolderChartLookup(folder: FolderDocument) {
	const { charts } = await ResolveFolderToCharts(folder, {}, false);

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

	const folders = await db.folders.find({});
	logger.info(`Reloading ${folders.length} folders.`);

	await Promise.all(folders.map(CreateFolderChartLookup));

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
