import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { EvaluatedGoalReturn, EvaluateGoalForUser } from "lib/targets/goals";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { FormatGame } from "tachi-common";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { GetUsersWithIDs, ResolveUser } from "utils/user";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve goals that have been recently achieved for this game.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/goals/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const recentlyAchievedUserGoals = await db["goal-subs"].find(
		{
			game,
			playtype,
			achieved: true,
			wasInstantlyAchieved: false,
		},
		{
			sort: {
				timeAchieved: -1,
			},
			limit: 10,
		}
	);

	const goals = await db.goals.find({
		goalID: { $in: recentlyAchievedUserGoals.map((e) => e.goalID) },
	});

	const users = await GetUsersWithIDs(recentlyAchievedUserGoals.map((e) => e.userID));

	return res.status(200).json({
		success: true,
		description: `Retrieved ${recentlyAchievedUserGoals.length} recently achieved goals.`,
		body: {
			goalSubs: recentlyAchievedUserGoals,
			goals,
			users,
		},
	});
});

const ResolveGoalID: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const goalID = req.params.goalID;

	const goal = await db.goals.findOne({
		goalID,
		game,
		playtype,
	});

	if (!goal) {
		return res.status(404).json({
			success: false,
			description: `A goal with ID ${goalID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { goalDoc: goal });

	return next();
};

/**
 * Retrieve information about this goal and who is subscribed to it.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/goals/:goalID
 */
router.get("/:goalID", ResolveGoalID, async (req, res) => {
	const goal = req[SYMBOL_TachiData]!.goalDoc!;

	const goalSubs = await db["goal-subs"].find({
		goalID: goal.goalID,
	});

	const users = await GetUsersWithIDs(goalSubs.map((e) => e.userID));

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${goal.name}.`,
		body: {
			goal,
			goalSubs,
			users,
		},
	});
});

/**
 * Evaluates a goal upon a user, even if they aren't subscribed to it.
 *
 * @param userID - The userID to evaluate this goal against. Must be a player of this GPT.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/goals/:goalID/evaluate-for
 */
router.get(
	"/:goalID/evaluate-for",
	ResolveGoalID,
	prValidate({
		userID: "string",
	}),
	async (req, res) => {
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;

		const userID = req.query.userID as string;

		const user = await ResolveUser(userID);

		if (!user) {
			return res.status(404).json({
				success: false,
				description: `The user ${userID} does not exist.`,
			});
		}

		const hasPlayed = await db["game-stats"].findOne({
			game,
			playtype,
			userID: user.id,
		});

		if (!hasPlayed) {
			return res.status(400).json({
				success: false,
				description: `The user ${user.username} hasn't played ${FormatGame(
					game,
					playtype
				)}.`,
			});
		}

		const goal = req[SYMBOL_TachiData]!.goalDoc!;
		const goalID = goal.goalID;

		const goalSub = await db["goal-subs"].findOne({
			userID: user.id,
			goalID,
		});

		let goalResults: EvaluatedGoalReturn;
		// shortcut evaluation by using the user goal
		if (goalSub) {
			goalResults = {
				achieved: goalSub.achieved,
				outOf: goalSub.outOf,
				outOfHuman: goalSub.outOfHuman,
				progress: goalSub.progress,
				progressHuman: goalSub.progressHuman,
			};
		} else {
			const results = await EvaluateGoalForUser(goal, user.id, logger);

			if (!results) {
				throw new Error(
					`Failed to evaluate goal ${goal.name} (${goal.goalID}) for user ${user.id}. More information above.`
				);
			}

			goalResults = results;
		}

		return res.status(200).json({
			success: true,
			description: `Evaluated ${goal.name} for ${user.username}.`,
			body: goalResults,
		});
	}
);

export default router;
