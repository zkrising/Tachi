import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateGoalTitle, ValidateGoalChartsAndCriteria } from "lib/targets/goal-utils";
import { EvaluateGoalForUser, GetQuestsThatContainGoal } from "lib/targets/goals";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { FormatGame } from "tachi-common";
import { GetMostSubscribedGoals } from "utils/db";
import { AssignToReqTachiData, GetGPT, GetTachiData } from "utils/req-tachi-data";
import { GetUsersWithIDs, ResolveUser } from "utils/user";
import type { RequestHandler } from "express";
import type { EvaluatedGoalReturn } from "lib/targets/goals";
import type { GoalDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Get the most popular goals for this GPT.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/goals/popular
 */
router.get("/popular", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const goals = await GetMostSubscribedGoals({ game, playtype });

	return res.status(200).json({
		success: true,
		description: `Returned ${goals.length} goals.`,
		body: goals,
	});
});

/**
 * Given a partial goal, return a name for it. This formats the goal into something like
 * "AAA 100 charts in the Level 12 folder".
 *
 * This is used by the quest editor, as the controls for formatting charts are done
 * on the backend.
 *
 * This is a post request because it expects nested data, and get requests suck
 * for that.
 *
 * @name POST /api/v1/games/:game/:playtype/targets/goals/format
 */
router.post(
	"/format",
	prValidate({
		criteria: {
			key: p.isIn(
				"scoreData.percent",
				"scoreData.lampIndex",
				"scoreData.gradeIndex",
				"scoreData.score"
			),

			// we do proper validation on this later.
			value: p.gte(0),
			mode: p.isIn("single", "absolute", "proportion"),
			countNum: (self, parent) => {
				if (parent.mode === "single") {
					return (
						self === undefined ||
						"Invalid countNum for mode 'single'. Must not have one!"
					);
				}

				// proper validation later.
				return p.gte(0)(self);
			},
		},
		charts: {
			type: p.isIn("single", "multi", "folder"),
			data: (self, parent) => {
				if (parent.type === "single") {
					return (
						typeof self === "string" ||
						"Expected a string in charts.data due to charts.type being 'single'."
					);
				} else if (parent.type === "multi") {
					return (
						(Array.isArray(self) &&
							self.every((k) => typeof k === "string") &&
							self.length <= 10 &&
							self.length > 1) ||
						"Expected an array of 2 to 10 strings in charts.data due to charts.type being 'multi'."
					);
					/* istanbul ignore next */
				} else if (parent.type === "folder") {
					return (
						typeof self === "string" ||
						"Expected a string in charts.data due to charts.type being 'folder'."
					);
				}

				// impossible to reach, so doesn't count for coverage.
				/* istanbul ignore next */
				return "Unknown charts.type.";
			},
		},
	}),
	async (req, res) => {
		const { game, playtype } = GetGPT(req);

		const { charts, criteria } = req.safeBody as {
			charts: GoalDocument["charts"];
			criteria: GoalDocument["criteria"];
		};

		try {
			await ValidateGoalChartsAndCriteria(charts, criteria, game, playtype);
		} catch (e) {
			const err = e as Error;

			return res.status(400).json({
				success: false,
				description: `Invalid goal: ${err.message}.`,
			});
		}

		const title = await CreateGoalTitle(charts, criteria, game, playtype);

		return res.status(200).json({
			success: true,
			description: `Formatted goal.`,
			body: title,
		});
	}
);

const ResolveGoalID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
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

	next();
};

/**
 * Retrieve information about this goal and who is subscribed to it.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/goals/:goalID
 */
router.get("/:goalID", ResolveGoalID, async (req, res) => {
	const goal = GetTachiData(req, "goalDoc");

	const goalSubs = await db["goal-subs"].find({
		goalID: goal.goalID,
	});

	const users = await GetUsersWithIDs(goalSubs.map((e) => e.userID));

	const parentQuests = await GetQuestsThatContainGoal(goal.goalID);

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${goal.name}.`,
		body: {
			goal,
			goalSubs,
			users,
			parentQuests,
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
		const { game, playtype } = GetGPT(req);

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

		const goal = GetTachiData(req, "goalDoc");
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
