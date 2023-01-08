import db from "external/mongo/db";
import { GetGPTString } from "tachi-common";
import type { GPTProfileCalculators } from "./types";
import type {
	GPTString,
	Game,
	PBScoreDocument,
	Playtype,
	ScoreRatingAlgorithms,
	Versions,
	integer,
	UserGameStats,
} from "tachi-common";

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
function CalcN<GPT extends GPTString>(
	key: ScoreRatingAlgorithms[GPT],
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
				// @ts-expect-error what? this can't be a symbol.
				[`calculatedData.${key}`]: { $type: "number" },
			},
			{
				limit: n,
				// @ts-expect-error what? this can't be a symbol.
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

function SumBestN<GPT extends GPTString>(
	key: ScoreRatingAlgorithms[GPT],
	n: integer,
	nullIfNotEnoughScores = false
) {
	return CalcN(key, n, false, nullIfNotEnoughScores);
}

function AvgBestN<GPT extends GPTString>(
	key: ScoreRatingAlgorithms[GPT],
	n: integer,
	nullIfNotEnoughScores = false
) {
	return CalcN(key, n, true, nullIfNotEnoughScores);
}

// Wacca has a funny algorithm for rate involving gitadora-style latest chart bonuses,
async function CalculateWACCARate(game: Game, playtype: Playtype, userID: integer) {
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

// basically the same as WACCA's.
async function CalculateMaimaiDXRate(game: Game, playtype: Playtype, userID: integer) {
	const newChartIDs = (
		await db.charts.maimaidx.find({ "data.isLatest": true }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const oldChartIDs = (
		await db.charts.maimaidx.find({ "data.isLatest": false }, { projection: { chartID: 1 } })
	).map((e) => e.chartID);

	const best15New = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: newChartIDs },
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

	const best35Old = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			chartID: { $in: oldChartIDs },
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

	if (best15New.length + best35Old.length === 0) {
		return null;
	}

	return (
		best15New.reduce((a, e) => a + e.calculatedData.rate!, 0) +
		best35Old.reduce((a, e) => a + e.calculatedData.rate!, 0)
	);
}

async function GetBestRatingOnSongs(
	songIDs: Array<integer>,
	userID: integer,
	game: Game,
	playtype: Playtype,
	ratingProp: "skill",
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

async function GetBestJubilityOnSongs(
	songIDs: Array<integer>,
	userID: integer,
	game: Game,
	playtype: Playtype,
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
			// we need to do stuff dependent on the chart difficulty,
			// so we need the chart difficulty
			$lookup: {
				from: "charts-jubeat",
				localField: "chartID",
				foreignField: "chartID",
				as: "chart",
			},
		},
		{
			// "chart" is an array unless we unwind it.
			$unwind: {
				path: "$chart",
			},
		},
		{
			// sort on jubility (so we get the best score)
			$sort: {
				[`calculatedData.jubility`]: -1,
			},
		},
		{
			$group: {
				_id: {
					songID: "$songID",

					// Jubility is unique upon songID + difficulty. However, you
					// cannot have a PB on both a HARD BSC and a BSC counted for
					// jubility. This query is awkward. Sorry!
					difficulty: {
						$switch: {
							branches: [
								{
									case: { $in: ["$chart.difficulty", ["HARD BSC", "BSC"]] },
									then: "BSC",
								},
								{
									case: { $in: ["$chart.difficulty", ["HARD ADV", "ADV"]] },
									then: "ADV",
								},
								{
									case: { $in: ["$chart.difficulty", ["HARD EXT", "EXT"]] },
									then: "EXT",
								},
							],
						},
					},
				},
				doc: { $first: "$$ROOT" },
			},
		},

		// for some godforsaken reason you have to sort twice. after a grouping
		// the sort order becomes nondeterministic
		{
			$sort: {
				[`doc.calculatedData.jubility`]: -1,
			},
		},
		{
			$limit: limit,
		},
	]);

	return r.map((e) => e.doc);
}

const CURRENT_JUBEAT_HOT_VERSION: Versions["jubeat:Single"] = "festo";

async function GetPBsForJubility(userID: integer) {
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
		GetBestJubilityOnSongs(hotSongIDs, userID, "jubeat", "Single", 30),
		GetBestJubilityOnSongs(coldSongIDs, userID, "jubeat", "Single", 30),
	]);

	return { bestHotScores, bestScores };
}

async function CalculateJubility(game: Game, playtype: Playtype, userID: integer): Promise<number> {
	const { bestHotScores, bestScores } = await GetPBsForJubility(userID);

	let jubility = 0;

	jubility = jubility + bestHotScores.reduce((a, e) => a + (e.calculatedData.jubility ?? 0), 0);
	jubility = jubility + bestScores.reduce((a, e) => a + (e.calculatedData.jubility ?? 0), 0);

	return jubility;
}

async function CalculateGitadoraSkill(game: Game, playtype: Playtype, userID: integer) {
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

export const PROFILE_CALCULATORS: GPTProfileCalculators = {
	"iidx:SP": {
		BPI: AvgBestN("BPI", 20, true),
		ktLampRating: AvgBestN("ktLampRating", 20),
	},
	"iidx:DP": {
		BPI: AvgBestN("BPI", 20, true),
		ktLampRating: AvgBestN("ktLampRating", 20),
	},

	"bms:14K": { sieglinde: AvgBestN("sieglinde", 20) },
	"bms:7K": { sieglinde: AvgBestN("sieglinde", 20) },
	"pms:Controller": { sieglinde: AvgBestN("sieglinde", 20) },
	"pms:Keyboard": { sieglinde: AvgBestN("sieglinde", 20) },

	"gitadora:Dora": { skill: CalculateGitadoraSkill, naiveSkill: SumBestN("skill", 50) },
	"gitadora:Gita": { skill: CalculateGitadoraSkill, naiveSkill: SumBestN("skill", 50) },

	"chunithm:Single": { naiveRating: AvgBestN("rating", 20) },
	"itg:Stamina": {
		// the sum of your 1 best blockrating/fastest32 is basically just
		// picking your best blockrating/fastest32. neat.
		highestBlock: SumBestN("blockRating", 1, true),
		fastest32: SumBestN("fastest32", 1, true),
	},
	"jubeat:Single": {
		jubility: CalculateJubility,
		naiveJubility: SumBestN("jubility", 60),
	},
	"maimaidx:Single": {
		rate: CalculateMaimaiDXRate,
		naiveRate: SumBestN("rate", 50),
	},
	"museca:Single": {
		curatorSkill: SumBestN("curatorSkill", 20),
	},
	"popn:9B": {
		naiveClassPoints: SumBestN("classPoints", 20),
	},
	"sdvx:Single": {
		VF6: SumBestN("VF6", 50),
	},
	"usc:Controller": {
		VF6: SumBestN("VF6", 50),
	},
	"usc:Keyboard": {
		VF6: SumBestN("VF6", 50),
	},
	"wacca:Single": {
		rate: CalculateWACCARate,
		naiveRate: SumBestN("rate", 50),
	},
};

/**
 * Calculate profile ratings for this UGPT.
 */
export async function CalculateProfileRatings(game: Game, playtype: Playtype, userID: integer) {
	const calculatedData: Record<string, number | null> = {};

	const gptString = GetGPTString(game, playtype);

	// Do this in parallel for performance.
	await Promise.all(
		Object.entries(PROFILE_CALCULATORS[gptString]).map(async ([key, fn]) => {
			calculatedData[key] = await fn(game, playtype, userID);
		})
	);

	return calculatedData as UserGameStats["ratings"];
}
