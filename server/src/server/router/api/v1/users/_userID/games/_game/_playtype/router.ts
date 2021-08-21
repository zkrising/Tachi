import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import {
	GetUGPTPlaycount,
	GetUsersRanking,
	GetUsersRankingAndOutOf,
	GetUsersWithIDs,
} from "utils/user";
import { CheckUserPlayedGamePlaytype } from "./middleware";
import { FilterQuery } from "mongodb";
import {
	UserGoalDocument,
	UserMilestoneDocument,
	GetGamePTConfig,
	integer,
	PBScoreDocument,
	UserGameStatsSnapshot,
} from "tachi-common";
import { CheckStrProfileAlg } from "utils/string-checks";
import { IsString } from "utils/misc";
import pbsRouter from "./pbs/router";
import sessionsRouter from "./sessions/router";
import foldersFolderIDRouter from "./folders/_folderID/router";
import tablesRouter from "./tables/router";
import showcaseRouter from "./showcase/router";
import settingsRouter from "./settings/router";
import scoresRouter from "./scores/router";

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
		GetUsersRankingAndOutOf(stats),
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
 * Returns a users game-stats for the past 90 days.
 * @name GET /api/v1/users/:userID/games/:game/:playtype/history
 */
router.get("/history", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const stats = req[SYMBOL_TachiData]!.requestedUserGameStats!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const snapshots = (await db["game-stats-snapshots"].find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			sort: {
				timestamp: -1,
			},
			// avoid sending so much garbage.
			projection: {
				userID: 0,
				game: 0,
				playtype: 0,
			},
			limit: 90,
		}
	)) as Omit<UserGameStatsSnapshot, "userID" | "game" | "playtype">[];

	const currentSnapshot: Omit<UserGameStatsSnapshot, "userID" | "game" | "playtype"> = {
		classes: stats.classes,
		ratings: stats.ratings,
		timestamp: Date.now(), // lazy, should probably be this midnight
		playcount: await GetUGPTPlaycount(user.id, game, playtype),
		ranking: await GetUsersRanking(stats),
	};

	return res.status(200).json({
		success: true,
		description: `Successfully returned history for the past ${snapshots.length} days.`,
		body: [currentSnapshot, ...snapshots],
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
 * Returns the users most played charts by playcount.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/most-played
 */
router.get("/most-played", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const mostPlayed: { playcount: integer; songID: integer; _id: string }[] =
		await db.scores.aggregate([
			{
				$match: {
					userID: user.id,
					game,
					playtype,
				},
			},
			{
				$group: {
					_id: "$chartID",
					// micro opt
					songID: { $first: "$songID" },
					playcount: { $sum: 1 },
				},
			},
			{
				$sort: {
					playcount: -1,
				},
			},
			{
				$limit: 100,
			},
		]);

	const chartIDs = mostPlayed.map((e) => e._id);
	const songIDs = mostPlayed.map((e) => e.songID);

	const [songs, charts, pbs] = await Promise.all([
		await db.songs[game].find({ id: { $in: songIDs } }),
		await db.charts[game].find({ chartID: { $in: chartIDs } }),
		await db["personal-bests"].find({ chartID: { $in: chartIDs }, userID: user.id }),
	]);

	const playcountMap = new Map();

	for (const doc of mostPlayed) {
		playcountMap.set(doc._id, doc.playcount);
	}

	// @ts-expect-error monkeypatching
	const playcountPBs = pbs as (PBScoreDocument & { __playcount: integer })[];

	// monkey patch __playcount on
	for (const pb of playcountPBs) {
		pb.__playcount = playcountMap.get(pb.chartID);
	}

	playcountPBs.sort((a, b) => b.__playcount - a.__playcount);

	return res.status(200).json({
		success: true,
		description: `Returned ${playcountPBs.length} scores.`,
		body: {
			songs,
			charts,
			pbs: playcountPBs,
		},
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

	const thisUsersStats = await db["game-stats"].findOne({ game, playtype, userID: user.id });

	if (!thisUsersStats) {
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
				[`ratings.${alg}`]: { $gt: thisUsersStats.ratings[alg] },
			},
			{
				limit: 5,
				sort: {
					[`ratings.${alg}`]: 1,
				},
			}
		),
		db["game-stats"].find(
			{
				game,
				playtype,
				userID: { $ne: user.id },
				[`ratings.${alg}`]: { $lte: thisUsersStats.ratings[alg] },
			},
			{
				limit: 5,
				sort: {
					[`ratings.${alg}`]: -1,
				},
			}
		),
	]);

	const users = await GetUsersWithIDs([
		...above.map((e) => e.userID),
		...below.map((e) => e.userID),
	]);

	const thisUsersRanking = await GetUsersRankingAndOutOf(thisUsersStats);

	return res.status(200).json({
		success: true,
		description: `Returned ${above.length + below.length} nearby stats.`,
		body: {
			above: above.reverse(),
			below,
			users,
			thisUsersStats,
			thisUsersRanking,
		},
	});
});

router.use("/pbs", pbsRouter);
router.use("/scores", scoresRouter);
router.use("/sessions", sessionsRouter);
router.use("/tables", tablesRouter);
router.use("/showcase", showcaseRouter);
router.use("/settings", settingsRouter);
router.use("/folders/:folderID", foldersFolderIDRouter);

export default router;
