import { Router } from "express";
import db from "../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import { GetRelevantSongsAndCharts } from "../../../../../../../../../utils/db";
import {
	GetUsersRanking,
	GetUsersWithIDs,
	ResolveUser,
} from "../../../../../../../../../utils/user";
import { CheckUserPlayedGamePlaytype } from "./middleware";
import { FilterQuery } from "mongodb";
import { UserGoalDocument, UserMilestoneDocument, GetGamePTConfig } from "tachi-common";
import {
	SearchGameSongsAndCharts,
	SearchSessions,
} from "../../../../../../../../../lib/search/search";
import { FilterChartsAndSongs } from "../../../../../../../../../utils/scores";
import { CheckStrProfileAlg } from "../../../../../../../../../utils/string-checks";
import { IsString } from "../../../../../../../../../utils/misc";
const router: Router = Router({ mergeParams: true });

router.use(CheckUserPlayedGamePlaytype);

/**
 * Returns information about a user for this game + playtype.
 * @name GET /api/v1/users/:userID/games/:game/:playtype
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const stats = req[SYMBOL_TachiData]!.requestedUserGameStats!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const [totalScores, firstScore, mostRecentScore, rankingData] = await Promise.all([
		db.scores.count({
			userID: user.id,
			game,
			playtype,
		}),
		db.scores.findOne(
			{
				userID: user.id,
				game,
				playtype,
				timeAchieved: { $ne: null },
			},
			{
				sort: {
					timeAchieved: 1,
				},
			}
		),
		db.scores.findOne(
			{
				userID: user.id,
				game,
				playtype,
				timeAchieved: { $ne: null },
			},
			{
				sort: {
					timeAchieved: -1,
				},
			}
		),
		GetUsersRanking(stats),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved user statistics for ${user.username} (${game} ${playtype})`,
		body: {
			gameStats: stats,
			firstScore,
			mostRecentScore,
			totalScores,
			rankingData,
		},
	});
});

/**
 * Returns a user's set goals for this game.
 * @param unachieved - If set, achieved goals will be hidden.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/goals
 */
router.get("/goals", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const query: FilterQuery<UserGoalDocument> = {
		userID: user.id,
		game,
		playtype,
	};

	if (req.query.unachieved) {
		query.achieved = false;
	}

	const userGoals = await db["user-goals"].find(query);

	const goals = await db.goals.find({
		goalID: { $in: userGoals.map((e) => e.goalID) },
	});

	return res.status(200).json({
		success: true,
		description: `Successfully returned ${userGoals.length} goal(s).`,
		body: {
			userGoals,
			goals,
		},
	});
});

/**
 * Returns a user's set milestones for this game.
 * @param unachieved - If set, achieved milestones will be hidden.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/milestones
 */
router.get("/milestones", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const query: FilterQuery<UserMilestoneDocument> = {
		userID: user.id,
		game,
		playtype,
	};

	if (req.query.unachieved) {
		query.achieved = false;
	}

	const userMilestones = await db["user-milestones"].find(query);

	const milestones = await db.milestones.find({
		milestoneID: { $in: userMilestones.map((e) => e.milestoneID) },
	});

	return res.status(200).json({
		success: true,
		description: `Successfully returned ${userMilestones.length} milestone(s).`,
		body: {
			userMilestones,
			milestones,
		},
	});
});

/**
 * Searches a user's individual scores.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/scores
 */
router.get("/scores", async (req, res) => {
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
router.get("/scores/recent", async (req, res) => {
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
 * Searches a user's personal bests.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/scores
 */
router.get("/pbs", async (req, res) => {
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
 * Returns a users best 100 personal-bests for this game.
 *
 * @param alg - Specifies an override for the default algorithm
 * to sort on. UNIMPLEMENTED.
 * @name GET /api/v1/users/:userID/games/:game/:playtype/pbs/best
 */
router.get("/pbs/best", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

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
				[`calculatedData.${gptConfig.defaultScoreRatingAlg}`]: -1,
			},
		}
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(pbs, game);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${pbs.length} personal bests.`,
		body: {
			scores: pbs,
			songs,
			charts,
		},
	});
});

/**
 * Search a users sessions.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions
 */
router.get("/sessions", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	if (typeof req.query.search !== "string") {
		return res.status(400).json({
			success: false,
			description: `Invalid value of ${req.query.search} for search parameter.`,
		});
	}

	const sessions = await SearchSessions(req.query.search, game, playtype, user.id, 100);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns a user's best 100 sessions according to the default statistic
 * for that game.
 *
 * @param alg - An override to specify a different algorithm for that game.
 * UNIMPLEMENTED!!!
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/best
 */
router.get("/sessions/best", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	const sessions = await db.sessions.find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			limit: 100,
			sort: {
				[`calculatedData.${gptConfig.defaultSessionRatingAlg}`]: -1,
			},
		}
	);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns the users around the given user on the leaderboard.
 *
 * @param alg - Optional, the algorithm to use.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/leaderboard-adjacent
 */
router.get("/leaderboard-adjacent", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	let alg = gptConfig.defaultProfileRatingAlg;
	if (IsString(req.query.alg)) {
		const temp = CheckStrProfileAlg(game, playtype, req.query.alg);

		if (temp === null) {
			return res.status(400).json({
				success: false,
				description: `Invalid value of ${
					req.query.alg
				} for alg. Expected one of ${gptConfig.profileRatingAlgs.join(", ")}`,
			});
		}

		alg = temp;
	}

	const yourStats = await db["game-stats"].findOne({ game, playtype, userID: user.id });

	if (!yourStats) {
		return res.status(400).json({
			success: false,
			description: `This user has not played this game.`,
		});
	}

	const [above, below] = await Promise.all([
		db["game-stats"].find(
			{
				game,
				playtype,
				userID: { $ne: user.id },
				[`ratings.${alg}`]: { $gte: yourStats.ratings[alg] },
			},
			{
				limit: 5,
			}
		),
		db["game-stats"].find(
			{
				game,
				playtype,
				userID: { $ne: user.id },
				[`ratings.${alg}`]: { $lte: yourStats.ratings[alg] },
			},
			{
				limit: 5,
			}
		),
	]);

	const users = await GetUsersWithIDs([
		...above.map((e) => e.userID),
		...below.map((e) => e.userID),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${above.length + below.length} nearby stats.`,
		body: {
			above,
			below,
			users,
			yourStats,
		},
	});
});

export default router;
