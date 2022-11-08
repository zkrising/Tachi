import db from "external/mongo/db";
import type { KtLogger } from "lib/logger/logger";
import type {
	Game,
	GPTSupportedVersions,
	IDStrings,
	integer,
	PBScoreDocument,
	Playtype,
	ScoreCalculatedDataLookup,
	UserGameStats,
} from "tachi-common";

type CustomCalcNames = ScoreCalculatedDataLookup[IDStrings];

function LazySumAll(key: CustomCalcNames) {
	return async (game: Game, playtype: Playtype, userID: integer) => {
		const sc = await db["personal-bests"].find({
			game,
			playtype,
			userID,
			isPrimary: true,
			[`calculatedData.${key}`]: { $type: "number" },
		});

		if (sc.length === 0) {
			return null;
		}

		const result = sc.reduce((a, e) => a + e.calculatedData[key]!, 0);

		return result;
	};
}

/**
 * Curries a function that returns the sum of N best ratings on `key`.
 *
 * @param key - What rating value to sum.
 * @param n - The amount of rating values to pull.
 * @param returnMean - Optionally, if true, return the sum of these values divided by N.
 * @param nullIfNotEnoughScores - If true, return null if the total scores this user has is less than N.
 *
 * @returns - Number if the user has scores with that rating algorithm, null if they have
 * no scores with this rating algorithm that are non-null.
 */
function LazyCalcN(
	key: CustomCalcNames,
	n: integer,
	returnMean = false,
	nullIfNotEnoughScores = false
) {
	return async (game: Game, playtype: Playtype, userID: integer) => {
		const sc = await db["personal-bests"].find(
			{
				game,
				playtype,
				userID,
				isPrimary: true,
				[`calculatedData.${key}`]: { $type: "number" },
			},
			{
				limit: n,
				sort: { [`calculatedData.${key}`]: -1 },
			}
		);

		if (sc.length === 0) {
			return null;
		}

		if (nullIfNotEnoughScores && sc.length < n) {
			return null;
		}

		let result = sc.reduce((a, e) => a + e.calculatedData[key]!, 0);

		if (returnMean) {
			result = result / n;
		}

		return result;
	};
}

const LazySumN = (key: CustomCalcNames, n: integer, nullIfNotEnoughScores = false) =>
	LazyCalcN(key, n, false, nullIfNotEnoughScores);
const LazyMeanN = (key: CustomCalcNames, n: integer, nullIfNotEnoughScores = false) =>
	LazyCalcN(key, n, true, nullIfNotEnoughScores);

type RatingFunction = (
	game: Game,
	playtype: Playtype,
	userID: integer,
	logger: KtLogger
) => Promise<UserGameStats["ratings"]>;

function GetGPTRatingFunction(game: Game, playtype: Playtype): RatingFunction {
	switch (`${game}:${playtype}` as IDStrings) {
		case "iidx:SP":
		case "iidx:DP":
			return async (g, p, u) => ({
				BPI: await LazyMeanN("BPI", 20, true)(g, p, u),
				ktLampRating: await LazyMeanN("ktLampRating", 20)(g, p, u),
			});
		case "sdvx:Single":
		case "usc:Keyboard":
		case "usc:Controller":
			return async (g, p, u) => ({
				VF6: await LazySumN("VF6", 50)(g, p, u),
			});
		case "ddr:SP":
		case "ddr:DP":
			return async (g, p, u) => ({
				MFCP: await LazySumAll("MFCP")(g, p, u),
				ktRating: await LazyMeanN("ktRating", 20)(g, p, u),
			});
		case "gitadora:Dora":
		case "gitadora:Gita":
			return async (g, p, u, l) => ({
				skill: await CalculateGitadoraSkill(g, p, u, l),
				naiveSkill: await LazySumN("skill", 50)(g, p, u),
			});
		case "bms:7K":
		case "bms:14K":
		case "pms:Keyboard":
		case "pms:Controller":
			return async (g, p, u) => ({
				sieglinde: await LazyMeanN("sieglinde", 20)(g, p, u),
			});
		case "chunithm:Single":
			return async (g, p, u) => ({
				naiveRating: await LazyMeanN("rating", 20)(g, p, u),
			});
		case "popn:9B":
			return async (g, p, u) => ({
				naiveClassPoints: await LazyMeanN("classPoints", 20)(g, p, u),
			});
		case "museca:Single":
			return async (g, p, u) => ({
				ktRating: await LazyMeanN("ktRating", 20)(g, p, u),
			});
		case "maimai:Single":
			return async (g, p, u) => ({
				ktRating: await LazyMeanN("ktRating", 20)(g, p, u),
			});
		case "wacca:Single":
			return async (g, p, u, l) => ({
				naiveRate: await LazySumN("rate", 50)(g, p, u),
				rate: await CalculateWACCARate(g, p, u, l),
			});
		case "jubeat:Single":
			return async (g, p, u, l) => ({
				jubility: await CalculateJubility(g, p, u, l),
				naiveJubility: await LazySumN("jubility", 60)(g, p, u),
			});
		case "itg:Stamina":
			// HighestX is equivalent to summing 1.
			return async (g, p, u) => ({
				highestBlock: await LazySumN("blockRating", 1, true)(g, p, u),
				highest32: await LazySumN("highest32", 1, true)(g, p, u),
				highest256: await LazySumN("highest256", 1, true)(g, p, u),
			});
	}
}

export function CalculateRatings(
	game: Game,
	playtype: Playtype,
	userID: integer,
	logger: KtLogger
): Promise<Partial<Record<CustomCalcNames, number | null>>> {
	const RatingFunction = GetGPTRatingFunction(game, playtype);

	return RatingFunction(game, playtype, userID, logger);
}

// Wacca has a funny algorithm for rate involving gitadora-style latest chart bonuses,
async function CalculateWACCARate(
	game: Game,
	playtype: Playtype,
	userID: integer,
	_logger: KtLogger
) {
	const hotChartIDs = (
		await db.charts.wacca.find({ "data.isHot": true }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const coldChartIDs = (
		await db.charts.wacca.find({ "data.isHot": false }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const best15Hot = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: hotChartIDs },
			"calculatedData.rate": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rate": -1,
			},
			limit: 15,
			projection: {
				"calculatedData.rate": 1,
			},
		}
	);

	const best35Cold = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: coldChartIDs },
			"calculatedData.rate": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rate": -1,
			},
			limit: 35,
			projection: {
				"calculatedData.rate": 1,
			},
		}
	);

	if (best15Hot.length + best35Cold.length === 0) {
		return null;
	}

	return (
		best15Hot.reduce((a, e) => a + e.calculatedData.rate!, 0) +
		best35Cold.reduce((a, e) => a + e.calculatedData.rate!, 0)
	);
}

async function CalculateGitadoraSkill(
	game: Game,
	playtype: Playtype,
	userID: integer,
	_logger: KtLogger
) {
	const hotSongIDs = (
		await db.songs.gitadora.find({ "data.isHot": true }, { projection: { id: 1 } })
	).map((e) => e.id);

	// get it
	const coldSongIDs = (
		await db.songs.gitadora.find({ "data.isHot": false }, { projection: { id: 1 } })
	).map((e) => e.id);

	const [bestHotScores, bestScores] = await Promise.all([
		GetBestRatingOnSongs(hotSongIDs, userID, game, playtype, "skill", 25),
		GetBestRatingOnSongs(coldSongIDs, userID, game, playtype, "skill", 25),
	]);

	if (bestHotScores.length + bestScores.length === 0) {
		return null;
	}

	let skill = 0;

	skill = skill + bestHotScores.reduce((a, e) => a + e.calculatedData.skill!, 0);
	skill = skill + bestScores.reduce((a, e) => a + e.calculatedData.skill!, 0);

	return skill;
}

export async function GetBestRatingOnSongs(
	songIDs: Array<integer>,
	userID: integer,
	game: Game,
	playtype: Playtype,
	ratingProp: "jubility" | "skill",
	limit: integer
): Promise<Array<PBScoreDocument>> {
	const r: Array<{ doc: PBScoreDocument }> = await db["personal-bests"].aggregate([
		{
			$match: {
				game,
				playtype,
				userID,
				songID: { $in: songIDs },
			},
		},
		{
			$sort: {
				[`calculatedData.${ratingProp}`]: -1,
			},
		},
		{
			$group: {
				_id: "$songID",
				doc: { $first: "$$ROOT" },
			},
		},

		// for some godforsaken reason you have to sort twice. after a grouping
		// the sort order becomes nondeterministic
		{
			$sort: {
				[`doc.calculatedData.${ratingProp}`]: -1,
			},
		},
		{
			$limit: limit,
		},
	]);

	return r.map((e) => e.doc);
}

const CURRENT_JUBEAT_HOT_VERSION: GPTSupportedVersions["jubeat:Single"] = "festo";

async function CalculateJubility(
	game: Game,
	playtype: Playtype,
	userID: integer,
	_logger: KtLogger
): Promise<number> {
	const hotSongs = await db.songs.jubeat.find(
		{ "data.displayVersion": CURRENT_JUBEAT_HOT_VERSION },
		{ projection: { id: 1 } }
	);

	const hotSongIDs = hotSongs.map((e) => e.id);

	const coldSongs = await db.songs.jubeat.find(
		{ "data.displayVersion": { $ne: CURRENT_JUBEAT_HOT_VERSION } },
		{ projection: { id: 1 } }
	);

	const coldSongIDs = coldSongs.map((e) => e.id);

	const [bestHotScores, bestScores] = await Promise.all([
		GetBestRatingOnSongs(hotSongIDs, userID, "jubeat", "Single", "jubility", 30),
		GetBestRatingOnSongs(coldSongIDs, userID, "jubeat", "Single", "jubility", 30),
	]);

	let jubility = 0;

	jubility = jubility + bestHotScores.reduce((a, e) => a + (e.calculatedData.jubility ?? 0), 0);
	jubility = jubility + bestScores.reduce((a, e) => a + (e.calculatedData.jubility ?? 0), 0);

	return jubility;
}
