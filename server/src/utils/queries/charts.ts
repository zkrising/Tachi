import db from "external/mongo/db";
import type { FilterQuery } from "mongodb";
import type {
	ChartDocument,
	Difficulties,
	Game,
	Versions,
	GPTString,
	integer,
	Playtype,
	Playtypes,
} from "tachi-common";

export function FindChartWithChartID(game: Game, chartID: string) {
	return db.anyCharts[game].findOne({ chartID });
}

/**
 * Find chart with PlaytypeDifficulty. This only finds charts that have `isPrimary` set to true.
 * If you want to find charts that are not primary, you need to use PTDFVersion.
 * @see FindChartWithPTDFVersion
 */
export function FindChartWithPTDF<
	G extends Game = Game,
	P extends Playtypes[G] = Playtypes[G],
	I extends GPTString = GPTString
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
	return db.anyCharts[game].findOne({
		songID,
		playtype,
		difficulty,
		isPrimary: true,
	});
}

/**
 * Find chart with Playtype, Difficulty and a given version. This does not necessarily return a chart that has
 * `isPrimary` set.
 */
export function FindChartWithPTDFVersion<
	G extends Game = Game,
	P extends Playtypes[G] = Playtypes[G],
	I extends GPTString = GPTString
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I], version: Versions[I]) {
	return db.anyCharts[game].findOne({
		songID,
		playtype,
		difficulty,
		versions: version,
	});
}

export function FindITGChartOnHash(hash: string) {
	return db.charts.itg.findOne({
		"data.hashGSV3": hash,
	});
}

/**
 * Find a BMS chart on either its md5sum or its sha256sum.
 * @param hash The md5 or sha256 hash to look for.
 */
export function FindBMSChartOnHash(hash: string) {
	return db.charts.bms.findOne({
		$or: [{ "data.hashMD5": hash }, { "data.hashSHA256": hash }],
	}) as Promise<ChartDocument<"bms:7K" | "bms:14K"> | null>;
}

/**
 * Find a chart on its in-game-ID, playtype and difficulty.
 */
export function FindChartOnInGameID(
	game: Game,
	inGameID: number,
	playtype: Playtype,
	difficulty: Difficulties[GPTString]
) {
	if (game === "bms" || game === "usc") {
		throw new Error(`Cannot call FindChartOnInGameID for game ${game}.`);
	}

	return db.anyCharts[game].findOne({
		"data.inGameID": inGameID,
		playtype,
		difficulty,
	});
}

/**
 * Finds a non-custom chart on its in-game-ID, playtype and difficulty.
 * This explicitly ignores 2dxtra charts, and is necessary to use for iidx to disambiguate.
 */
export function FindIIDXChartOnInGameID(
	inGameID: number,
	playtype: Playtype,
	difficulty: Difficulties[GPTString]
) {
	return db.charts.iidx.findOne({
		"data.inGameID": inGameID,
		"data.2dxtraSet": null,
		isPrimary: true,
		playtype,
		difficulty,
	});
}

/**
 * Finds a non-custom chart on its in-game-ID, playtype and difficulty.
 * This explicitly ignores 2dxtra charts, and is necessary to use for iidx to disambiguate.
 */
export function FindIIDXChartOnInGameIDVersion(
	inGameID: number,
	playtype: Playtype,
	difficulty: Difficulties[GPTString],
	version: Versions[GPTString]
) {
	return db.charts.iidx.findOne({
		"data.inGameID": inGameID,
		"data.2dxtraSet": null,
		playtype,
		difficulty,
		versions: version,
	});
}

/**
 * Find a chart on its in-game-ID, playtype, difficulty and version.
 */
export function FindChartOnInGameIDVersion<I extends GPTString = GPTString>(
	game: Game,
	inGameID: number,
	playtype: Playtype,
	difficulty: Difficulties[I],
	version: Versions[I]
) {
	return db.anyCharts[game].findOne({
		"data.inGameID": inGameID,
		versions: version,
		playtype,
		difficulty,
	});
}

/**
 * Finds an IIDX chart on its 2dxtra hash, which is the sha256 of the .1 buffer.
 */
export function FindIIDXChartWith2DXtraHash(hash: string) {
	return db.charts.iidx.findOne({
		"data.hashSHA256": hash,
	});
}

/**
 * Find an SDVX Chart on its in game ID. This exists to handle
 * oddities with SDVX difficulties - If "ANY_INF" is sent, it actually
 * refers to any of INF, GRV, HVN or VVD. This is because some services treat
 * all of those as the same difficulty, but we do not.
 */
export function FindSDVXChartOnInGameID(
	inGameID: number,
	difficulty: Difficulties["sdvx:Single"] | "ANY_INF"
) {
	const diffQuery =
		difficulty === "ANY_INF"
			? { $in: ["INF", "GRV", "HVN", "VVD", "XCD"] as Array<Difficulties["sdvx:Single"]> }
			: difficulty;

	return db.charts.sdvx.findOne({
		"data.inGameID": inGameID,
		difficulty: diffQuery,
		isPrimary: true,
	});
}

export function FindSDVXChartOnInGameIDVersion(
	inGameID: number,
	difficulty: Difficulties["sdvx:Single"] | "ANY_INF",
	version: Versions["sdvx:Single"]
) {
	const diffQuery =
		difficulty === "ANY_INF"
			? { $in: ["INF", "GRV", "HVN", "VVD", "XCD"] as Array<Difficulties["sdvx:Single"]> }
			: difficulty;

	return db.charts.sdvx.findOne({
		"data.inGameID": inGameID,
		difficulty: diffQuery,
		versions: version,
	});
}

export function FindSDVXChartOnDFVersion(
	songID: integer,
	difficulty: Difficulties["sdvx:Single"] | "ANY_INF",
	version: Versions["sdvx:Single"]
) {
	const diffQuery =
		difficulty === "ANY_INF"
			? { $in: ["INF", "GRV", "HVN", "VVD", "XCD"] as Array<Difficulties["sdvx:Single"]> }
			: difficulty;

	return db.charts.sdvx.findOne({
		songID,
		difficulty: diffQuery,
		versions: version,
	});
}

export function FindChartOnSHA256(game: Game, hash: string) {
	if (game !== "bms" && game !== "usc" && game !== "iidx" && game !== "pms") {
		throw new Error(`Cannot call FindChartOnSHA256 for game ${game}.`);
	}

	return db.anyCharts[game].findOne({
		"data.hashSHA256": hash,
	});
}

export function FindChartOnSHA256Playtype(game: Game, hash: string, playtype: Playtype) {
	if (game !== "bms" && game !== "usc" && game !== "iidx" && game !== "pms") {
		throw new Error(`Cannot call FindChartOnSHA256 for game ${game}.`);
	}

	return db.anyCharts[game].findOne({
		"data.hashSHA256": hash,
		playtype,
	});
}

/**
 * Returns the N most popular charts for this game + playtype.
 * Popularity is determined by how many scores match in the score
 * collection.
 */
export async function FindChartsOnPopularity(
	game: Game,
	playtype: Playtype,
	songIDs?: Array<integer>,
	skip = 0,
	limit = 100,
	scoreCollection: "personal-bests" | "scores" = "personal-bests"
): Promise<Array<ChartDocument & { __playcount: integer }>> {
	const matchQuery: FilterQuery<ChartDocument> = {
		playtype,
	};

	if (songIDs) {
		matchQuery.songID = { $in: songIDs };
	}

	// MongoDB is a hard beast to wield.
	// This code might look very inefficient, but originally this *was*
	// a single aggregate pipeline.
	//
	// We've split it up into multiple queries as this is an order of
	// magnitude faster.
	// Not entirely sure why, but $lookup is incredibly inefficient,
	// and you should just avoid it.
	const charts = (await db.anyCharts[game].find(matchQuery)) as unknown as Array<
		ChartDocument & {
			__playcount: integer;
		}
	>;

	const scoreCounts: Array<{ _id: string; count: integer }> = await db[scoreCollection].aggregate(
		[
			{
				$match: { chartID: { $in: charts.map((e) => e.chartID) } },
			},
			{
				$group: {
					_id: "$chartID",
					count: { $sum: 1 },
				},
			},
			{
				$sort: {
					count: -1,
				},
			},
			{
				$skip: skip,
			},
			{
				$limit: limit,
			},
		]
	);

	const scoreCountMap = new Map<string, integer>();

	for (const sc of scoreCounts) {
		scoreCountMap.set(sc._id, sc.count);
	}

	for (const chart of charts) {
		chart.__playcount = scoreCountMap.get(chart.chartID) ?? 0;
	}

	return charts.sort((a, b) => b.__playcount - a.__playcount).slice(skip, skip + limit);
}
