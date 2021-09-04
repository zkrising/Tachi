import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchGameSongsAndCharts } from "lib/search/search";
import { GetRelevantSongsAndCharts } from "utils/db";
import { FilterChartsAndSongs, GetScoreIDsFromComposed } from "utils/scores";
import { GetGamePTConfig } from "tachi-common";
import { IsValidScoreAlg } from "utils/misc";

const router: Router = Router({ mergeParams: true });

/**
 * Searches a user's personal bests.
 *
 * @param search - The search criteria.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/pbs
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	if (typeof req.query.search !== "string") {
		return res.status(400).json({
			success: false,
			description: `Invalid value of ${req.query.search} for search parameter.`,
		});
	}

	const { songs: allSongs, charts: allCharts } = await SearchGameSongsAndCharts(
		game,
		req.query.search,
		playtype
	);

	const pbs = await db["personal-bests"].find(
		{
			chartID: { $in: allCharts.map((e) => e.chartID) },
			userID: user.id,
		},
		{
			sort: {
				timeAchieved: -1,
			},
			limit: 30,
		}
	);

	const { songs, charts } = FilterChartsAndSongs(pbs, allCharts, allSongs);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${pbs.length} personal bests.`,
		body: {
			pbs,
			songs,
			charts,
		},
	});
});

/**
 * Returns all of a users personal bests.
 *
 * @warn This endpoint is probably quite expensive. We'll need to do
 * some performance tests.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/pbs/all
 */
router.get("/all", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const pbs = await db["personal-bests"].find({
		userID: user.id,
		game,
		playtype,
		isPrimary: true,
	});

	const { songs, charts } = await GetRelevantSongsAndCharts(pbs, game);

	return res.status(200).json({
		success: true,
		description: `Returned ${pbs.length} PBs.`,
		body: { pbs, songs, charts },
	});
});

/**
 * Returns a users best 100 personal-bests for this game.
 *
 * @param alg - Specifies an override for the default algorithm
 * to sort on.
 * @name GET /api/v1/users/:userID/games/:game/:playtype/pbs/best
 */
router.get("/best", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	if (req.query.alg && !IsValidScoreAlg(gptConfig, req.query.alg)) {
		return res.status(400).json({
			success: false,
			description: `Invalid score algorithm. Expected any of ${gptConfig.scoreRatingAlgs.join(
				", "
			)}`,
		});
	}

	const alg = req.query.alg ?? gptConfig.defaultScoreRatingAlg;

	const pbs = await db["personal-bests"].find(
		{
			userID: user.id,
			game,
			playtype,
			isPrimary: true,
		},
		{
			limit: 100,
			sort: {
				[`calculatedData.${alg}`]: -1,
			},
		}
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(pbs, game);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${pbs.length} personal bests.`,
		body: {
			pbs,
			songs,
			charts,
		},
	});
});

/**
 * Returns a user's PB on the given chart. If the user has not played this chart, 404 is
 * returned.
 *
 * @param getComposition - Also retrieves the score documents that composed this PB.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/pbs/:chartID
 */
router.get("/:chartID", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const chart = await db.charts[game].findOne({
		chartID: req.params.chartID,
		playtype,
	});

	if (!chart) {
		return res.status(404).json({
			success: false,
			description: `This chart does not exist.`,
		});
	}

	const pb = await db["personal-bests"].findOne({
		chartID: req.params.chartID,
		userID: user.id,
	});

	if (!pb) {
		return res.status(404).json({
			success: false,
			description: `This user has not played this chart.`,
		});
	}

	if (req.query.getComposition) {
		const scoreIDs = GetScoreIDsFromComposed(pb);

		const scores = await db.scores.find({
			scoreID: { $in: scoreIDs },
		});

		return res.status(200).json({
			success: true,
			description: `Successfully retrieved PB for user.`,
			body: {
				scores,
				chart,
				pb,
			},
		});
	}

	return res.status(200).json({
		success: true,
		description: `Successfully retrieved PB for user.`,
		body: {
			pb,
			chart,
		},
	});
});

export default router;
