import foldersRouter from "./folders/router";
import { CheckUserPlayedGamePlaytype } from "./middleware";
import pbsRouter from "./pbs/router";
import rivalsRouter from "./rivals/router";
import scoresRouter from "./scores/router";
import sessionsRouter from "./sessions/router";
import settingsRouter from "./settings/router";
import showcaseRouter from "./showcase/router";
import tablesRouter from "./tables/router";
import targetsRouter from "./targets/router";
import { Router } from "express";
import db from "external/mongo/db";
import { GetGamePTConfig } from "tachi-common";
import { IsString } from "utils/misc";
import { GetTachiData, GetUGPT } from "utils/req-tachi-data";
import { CheckStrProfileAlg } from "utils/string-checks";
import {
	GetAllRankings,
	GetUGPTPlaycount,
	GetUsersRankingAndOutOf,
	GetUsersWithIDs,
} from "utils/user";
import type { integer, PBScoreDocument, UserGameStatsSnapshot } from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(CheckUserPlayedGamePlaytype);

/**
 * Returns information about a user for this game + playtype.
 * @name GET /api/v1/users/:userID/games/:game/:playtype
 */
router.get("/", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const stats = GetTachiData(req, "requestedUserGameStats");

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
		GetAllRankings(stats),
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
	const { game, playtype, user } = GetUGPT(req);

	const stats = GetTachiData(req, "requestedUserGameStats");

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
			limit: 30,
		}
	)) as Array<Omit<UserGameStatsSnapshot, "game" | "playtype" | "userID">>;

	const currentSnapshot: Omit<UserGameStatsSnapshot, "game" | "playtype" | "userID"> = {
		classes: stats.classes,
		ratings: stats.ratings,

		// lazy, should probably be this midnight
		timestamp: Date.now(),
		playcount: await GetUGPTPlaycount(user.id, game, playtype),
		rankings: await GetAllRankings(stats),
	};

	return res.status(200).json({
		success: true,
		description: `Successfully returned history for the past ${snapshots.length} days.`,
		body: [currentSnapshot, ...snapshots],
	});
});

/**
 * Returns the users most played charts by playcount.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/most-played
 */
router.get("/most-played", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const mostPlayed: Array<{ playcount: integer; songID: integer; _id: string }> =
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

	const playcountMap = new Map<string, integer>();

	for (const doc of mostPlayed) {
		playcountMap.set(doc._id, doc.playcount);
	}

	// @ts-expect-error monkeypatching
	const playcountPBs = pbs as Array<PBScoreDocument & { __playcount: integer }>;

	// monkey patch __playcount on
	for (const pb of playcountPBs) {
		pb.__playcount = playcountMap.get(pb.chartID) ?? 0;
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
	const { game, playtype, user } = GetUGPT(req);

	const gptConfig = GetGamePTConfig(game, playtype);

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

	const thisUsersRanking = await GetUsersRankingAndOutOf(thisUsersStats, alg);

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
router.use("/folders", foldersRouter);
router.use("/targets", targetsRouter);
router.use("/rivals", rivalsRouter);

export default router;
