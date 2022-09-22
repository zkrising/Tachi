import {
	AllDatabaseSeeds,
	ChartDocument,
	CreateSongMap,
	DatabaseSeedNames,
	FolderDocument,
	Game,
	SongDocument,
} from "tachi-common";
import {
	BMSCourseWithRelated,
	ChartWithRelated,
	DatabaseSeedsWithRelated,
	TableWithRelated,
} from "types/seeds";
import { APIFetchV1 } from "./api";

/**
 * Given a repo and a reference return the status of database-seeds/collections
 * as of that commit.
 *
 * If "WORKING_DIRECTORY" is passed as a ref, and the repository is local, this will
 * be inferred as reading from the current state of collections on-disk.
 */
export async function LoadSeeds(repo: string, ref: string): Promise<Partial<AllDatabaseSeeds>> {
	if (repo === "local") {
		const params = new URLSearchParams();

		if (ref !== "WORKING_DIRECTORY") {
			params.set("revision", ref);
		}

		const res = await APIFetchV1<Partial<AllDatabaseSeeds>>(
			`/seeds/collections?${params.toString()}`
		);

		if (!res.success) {
			throw new Error(
				`Failed to fetch collections @ ${ref}. ${res.statusCode}: ${res.description}`
			);
		}

		return res.body;
	} else if (repo.startsWith("GitHub:")) {
		const data: Partial<AllDatabaseSeeds> = {};

		await Promise.all(
			DatabaseSeedNames.map(async (file) => {
				const res = await fetch(
					`https://raw.githubusercontent.com/${repo.substring(
						"GitHub:".length
					)}/${ref}/database-seeds/collections/${file}`
				);

				if (res.status === 404) {
					data[file] = [];
				} else if (res.status === 200) {
					data[file] = await res.json();
				} else {
					throw new Error(
						`Failed to fetch collections @ ${repo} ${ref}. ${
							res.status
						} ${await res.text()}`
					);
				}
			})
		);

		return data;
	}

	throw new Error(`Unknown repository type '${repo}'.`);
}

type NotSongsChartsSeeds = Exclude<
	keyof AllDatabaseSeeds,
	`songs-${Game}.json` | `charts-${Game}.json`
>;

export function MakeDataset<K extends keyof AllDatabaseSeeds>(
	file: K,
	data: Partial<AllDatabaseSeeds>
) /*: DatabaseSeedsWithRelated[K] */ {
	if (file.startsWith("songs-")) {
		return data[file] ?? [];
	} else if (file.startsWith("charts-")) {
		return RelateCharts(data, file);
	}

	const f = file as NotSongsChartsSeeds;

	switch (f) {
		case "bms-course-lookup.json":
			return RelateBMSCourses(data);

		case "folders.json":
			// folders don't need any extra data.
			return data["folders.json"] ?? [];

		case "goals.json":
		case "milestone-sets.json":
		case "milestones.json":
			throw new Error("GOALS NOT SUPPORTED ZZZZ");
		case "tables.json":
			return RelateTables(data);
	}
}

function RelateBMSCourses(data: Partial<AllDatabaseSeeds>): BMSCourseWithRelated[] {
	const base = data["bms-course-lookup.json"];

	if (!base) {
		return [];
	}

	const bmsSongs = data["songs-bms.json"];
	const bmsCharts = data["charts-bms.json"];

	if (!bmsSongs || !bmsCharts) {
		throw new Error(
			`Couldn't find songs-bms/charts-bms, but tried to render bms-course-lookup. Not possible?`
		);
	}

	const songMap = CreateSongMap(bmsSongs);
	const chartMap = new Map<string, ChartDocument<"bms:7K" | "bms:14K">>();

	for (const chart of bmsCharts) {
		chartMap.set(chart.data.hashMD5, chart);
	}

	return base.map((course) => {
		// md5 hashes are 32 chars long; a bms course may be comprised of any amount of
		// md5s. This splits the string every 32 characters into an array.
		const md5s = course.md5sums.match(/.{32}/gu);

		if (!md5s) {
			throw new Error(`Invalid MD5s in BMS Course? Got ${md5s}.`);
		}

		const dwr: BMSCourseWithRelated = {
			...course,
			__related: {
				entries: md5s.map((e) => {
					if (!chartMap.has(e)) {
						return e;
					}

					return {
						chart: chartMap.get(e)!,
						song: songMap.get(chartMap.get(e)!.songID)!,
					};
				}),
			},
		};

		return dwr;
	});
}

function RelateTables(data: Partial<AllDatabaseSeeds>): TableWithRelated[] {
	const base = data["tables.json"];

	if (!base) {
		return [];
	}

	const folderMap = new Map<string, FolderDocument>();

	for (const folder of data["folders.json"] ?? []) {
		folderMap.set(folder.folderID, folder);
	}

	return base.map((e) => ({
		...e,
		__related: {
			// If the table refers to a folder that doesn't exist
			// (which is entirely possible and has happened before)
			// then when the table renderer goes to render its folders, it will get
			// undefined anyway.
			folders: Object.fromEntries(e.folders.map((e) => [e, folderMap.get(e)])),
		},
	}));
}

function RelateCharts(data: Partial<AllDatabaseSeeds>, file: string): ChartWithRelated[] {
	const [_, game] = /charts-(.*?)\.json/u.exec(file)!;

	// @ts-expect-error too lazy to fix this properly
	const songs: SongDocument[] = data[`songs-${game}.json`];
	// @ts-expect-error too lazy to fix this properly
	const charts: ChartDocument[] = data[`charts-${game}.json`];

	if (!charts) {
		return [];
	}

	if (!songs) {
		throw new Error(`Game ${game} has charts, but no songs?`);
	}

	const songMap = CreateSongMap(songs);

	return charts.map((e) => ({
		...e,
		__related: {
			song: songMap.get(e.songID),
		},
	}));
}
