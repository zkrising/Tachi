import { Difficulties, Game, integer, Playtypes, IDStrings, AnyChartDocument } from "tachi-common";
import db from "../../external/mongo/db";
import { FilterQuery } from "mongodb";

export function FindChartWithChartID(game: Game, chartID: string) {
	return db.charts[game].findOne({ chartID });
}

/**
 * Find chart with PlaytypeDifficulty. This only finds charts that have `isPrimary` set to true.
 * If you want to find charts that are not primary, you need to use PTDFVersion.
 * @see FindChartWithPTDFVersion
 */
export function FindChartWithPTDF<
	G extends Game = Game,
	P extends Playtypes[G] = Playtypes[G],
	I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
	return db.charts[game].findOne({
		songID: songID,
		playtype: playtype,
		difficulty: difficulty,
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
	I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I], version: string) {
	return db.charts[game].findOne({
		songID: songID,
		playtype: playtype,
		difficulty: difficulty,
		versions: version,
	});
}

/**
 * Finds a DDR Chart based on its "song hash".
 * Songs in DDR have a consistent checksum-like identifier used on the e-amusement website.
 * We can use this to locate a chart by combining it with a playtype and difficulty.
 *
 * Despite the potentially confusing name of "songHash", songs are NOT meant to store lookup-like tokens.
 * This is just for simplification reasons.
 * @param songHash The identifier for the song.
 * @param playtype The playtype for the chart.
 * @param difficulty The difficulty for the chart.
 */
export function FindDDRChartOnSongHash(
	songHash: string,
	// Technically both of these should be "ddr" instead of Game, but it proves hard to work with.
	playtype: Playtypes[Game],
	difficulty: Difficulties[IDStrings]
) {
	// note: this only works on accident because monk
	// allows any strings like "foo.bar".
	// We *should* normally cast this to ChartDocument<"ddr:SP" | "ddr:DP">
	return db.charts.ddr.findOne({
		"data.songHash": songHash,
		playtype,
		difficulty,
		isPrimary: true,
	});
}

/**
 * Find a BMS chart on either its md5sum or its sha256sum.
 * @param hash The md5 or sha256 hash to look for.
 */
export function FindBMSChartOnHash(hash: string) {
	return db.charts.bms.findOne({
		$or: [{ "data.hashMD5": hash }, { "data.hashSHA256": hash }],
	});
}

/**
 * Find a chart on its in-game-ID, playtype and difficulty.
 */
export function FindChartOnInGameID(
	game: Game,
	inGameID: number,
	playtype: Playtypes[Game],
	difficulty: Difficulties[IDStrings]
) {
	if (game === "bms" || game === "usc") {
		throw new Error(`Cannot call FindChartOnInGameID for game ${game}.`);
	}

	return db.charts[game].findOne({
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
	playtype: Playtypes[Game],
	difficulty: Difficulties[IDStrings]
) {
	return db.charts.iidx.findOne({
		"data.inGameID": inGameID,
		"flags.2dxtra": false,
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
	playtype: Playtypes[Game],
	difficulty: Difficulties[IDStrings],
	version: string
) {
	return db.charts.iidx.findOne({
		"data.inGameID": inGameID,
		"flags.2dxtra": false,
		playtype,
		difficulty,
		versions: version,
	});
}

/**
 * Find a chart on its in-game-ID, playtype, difficulty and version.
 */
export function FindChartOnInGameIDVersion(
	game: Game,
	inGameID: number,
	playtype: Playtypes[Game],
	difficulty: Difficulties[IDStrings],
	version: string
) {
	return db.charts[game].findOne({
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
			? { $in: ["INF", "GRV", "HVN", "VVD"] as Difficulties["sdvx:Single"][] }
			: difficulty;

	return db.charts.sdvx.findOne({
		"data.inGameID": inGameID,
		difficulty: diffQuery,
		isPrimary: true,
	});
}

export function FindSDVXChartOnInGameIDVersion(
	inGameID: number,
	difficulty: "NOV" | "ADV" | "EXH" | "MXM" | "ANY_INF",
	version: string
) {
	const diffQuery =
		difficulty === "ANY_INF"
			? { $in: ["INF", "GRV", "HVN", "VVD"] as Difficulties["sdvx:Single"][] }
			: difficulty;

	return db.charts.sdvx.findOne({
		"data.inGameID": inGameID,
		difficulty: diffQuery,
		versions: version,
	});
}

export function FindChartOnSHA256(game: Game, hash: string) {
	if (game !== "bms" && game !== "usc" && game !== "iidx") {
		throw new Error(`Cannot call FindChartOnSHA256 for game ${game}.`);
	}

	return db.charts[game].findOne({
		"data.hashSHA256": hash,
	});
}

export function FindChartOnARCID(game: "iidx" | "ddr" | "jubeat" | "sdvx", arcID: string) {
	return db.charts[game].findOne({
		"data.arcChartID": arcID,
	});
}

/**
 * Returns the N most popular charts for this game + playtype.
 * Popularity is determined by how many scores match in the score
 * collection.
 *
 * Performance of this is untested.
 */
export function FindChartsOnPopularity(
	game: Game,
	playtype: Playtypes[Game],
	songIDs?: integer[],
	skip = 0,
	limit = 100,
	scoreCollection: "personal-bests" | "scores" = "personal-bests"
): Promise<(AnyChartDocument & { __playcount: integer })[]> {
	const matchQuery: FilterQuery<AnyChartDocument> = {
		playtype,
	};

	if (songIDs) {
		matchQuery.songID = { $in: songIDs };
	}

	return db.charts[game].aggregate([
		{
			$match: matchQuery,
		},
		{
			$lookup: {
				from: scoreCollection,
				localField: "chartID",
				foreignField: "chartID",
				as: "pbs",
			},
		},
		{
			$addFields: {
				__playcount: { $size: "$pbs" },
			},
		},
		{
			$project: {
				pbs: 0,
			},
		},
		{
			$sort: {
				__playcount: -1,
			},
		},
		{
			$skip: skip,
		},
		{
			$limit: limit,
		},
	]);
}
