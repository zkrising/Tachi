import { Router } from "express";
import db from "../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import { GetRelevantSongsAndCharts } from "../../../../../../../../../utils/db";
import { GetDefaultScoreRatingAlg, GetUsersRanking } from "../../../../../../../../../utils/user";
import { CheckUserPlayedGamePlaytype } from "./middleware";
import { FilterQuery } from "mongodb";
import { UserGoalDocument, UserMilestoneDocument } from "tachi-common";

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
 * Returns a users recent 100 scores for this game.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/recent-scores
 */
router.get("/recent-scores", async (req, res) => {
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
 * Returns a users best 100 personal-bests for this game.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/best
 */
router.get("/best", async (req, res) => {
    const user = req[SYMBOL_TachiData]!.requestedUser!;
    const game = req[SYMBOL_TachiData]!.game!;
    const playtype = req[SYMBOL_TachiData]!.playtype!;

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
                [`calculatedData.${GetDefaultScoreRatingAlg(game, playtype)}`]: -1,
            },
        }
    );

    const { songs, charts } = await GetRelevantSongsAndCharts(pbs, game);

    return res.status(200).json({
        success: true,
        description: `Retrieved ${pbs.length} scores.`,
        body: {
            scores: pbs,
            songs,
            charts,
        },
    });
});

export default router;
