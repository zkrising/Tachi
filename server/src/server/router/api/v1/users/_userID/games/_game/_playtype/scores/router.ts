import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchGameSongsAndCharts } from "lib/search/search";
import { GetRelevantSongsAndCharts } from "utils/db";
import { FilterChartsAndSongs } from "utils/scores";

const router: Router = Router({ mergeParams: true });

/**
 * Searches a user's individual scores.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/scores
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

	const scores = await db.scores.find(
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

	const { songs, charts } = FilterChartsAndSongs(scores, allCharts, allSongs);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${scores.length} scores.`,
		body: {
			scores,
			songs,
			charts,
		},
	});
});

/**
 * Returns a users recent 100 scores for this game.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/scores/recent
 */
router.get("/recent", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const recentScores = await db.scores.find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			limit: 100,
			sort: {
				timeAchieved: -1,
			},
		}
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(recentScores, game);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${recentScores.length} scores.`,
		body: {
			scores: recentScores,
			songs,
			charts,
		},
	});
});

/**
 * Retrieve all the scores a user has on the given chartID.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/scores/:chartID
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

	const scores = await db.scores.find({
		userID: user.id,
		chartID: chart.chartID,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${scores.length} scores.`,
		body: scores,
	});
});

export default router;
