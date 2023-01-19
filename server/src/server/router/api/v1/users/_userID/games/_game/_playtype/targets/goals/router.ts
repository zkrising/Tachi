import { RequireAuthedAsUser } from "../../../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import {
	ConstructGoal,
	GetQuestsThatContainGoal,
	SubscribeToGoal,
	UnsubscribeFromGoal,
} from "lib/targets/goals";
import { GetParentQuests } from "lib/targets/quests";
import { p } from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import prValidate from "server/middleware/prudence-validate";
import { GetGamePTConfig } from "tachi-common";
import { GetGoalForIDGuaranteed } from "utils/db";
import { AssignToReqTachiData, GetTachiData, GetUGPT } from "utils/req-tachi-data";
import type { RequestHandler } from "express";
import type { GoalDocument, QuestDocument } from "tachi-common";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Retrieves this user's set goals for this GPT.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/goals
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const goalSubs = await db["goal-subs"].find({
		userID: user.id,
		game,
		playtype,
	});

	const goals = await db.goals.find({
		goalID: { $in: goalSubs.map((e) => e.goalID) },
	});

	const allQuests = await GetParentQuests(user.id, game, playtype, goalSubs);

	const questSubs = await db["quest-subs"].find({ userID: user.id, game, playtype });

	const questSubIDs = questSubs.map((e) => e.questID);

	// filter parent quests to only those that this user is subscribed to
	const quests = allQuests.filter((quest) => questSubIDs.includes(quest.questID));

	return res.status(200).json({
		success: true,
		description: `Retrieved ${goalSubs.length} goal(s).`,
		body: {
			goals,
			goalSubs,
			quests,
			questSubs,
		},
	});
});

type GoalCreationBody = Pick<GoalDocument, "charts" | "criteria">;

/**
 * Add a goal to your account. If the goal document already exists, it is subscribed to.
 * Otherwise, that goal document is created, and then subscribed to.
 *
 * @param criteria.key - The key for the goal to be on. This is stuff like scoreData.percent.
 * @param criteria.value - The value the key must be greater than for it to count as achieved.
 * @param criteria.mode - "single", "absolute" or "proportion". If abs or proportion, countNum
 * must be supplied.
 * @param criteria.countNum - For abs/proportion mode. Atleast N scores must achieve the
 * key:value condition.
 *
 * @param charts.type - "single", "multi" or "folder".
 * @param charts.data - an identifier for the set of charts must be
 * supplied here. For single, this is a chartID. For multi, this is an array of chartIDs.
 * For folder, this is a folderID.
 *
 * @name POST /api/v1/users/:userID/games/:game/:playtype/targets/goals/add-goal
 */
router.post(
	"/add-goal",
	RequireAuthedAsUser,
	RequirePermissions("manage_targets"),
	prValidate({
		criteria: {
			// we do proper validation on this later.
			key: "string",
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
		const { user, game, playtype } = GetUGPT(req);

		const existingGoalsCount = await db["goal-subs"].count({
			userID: user.id,
			game,
			playtype,
		});

		if (existingGoalsCount > ServerConfig.MAX_GOAL_SUBSCRIPTIONS) {
			return res.status(400).json({
				success: false,
				description: `You already have ${ServerConfig.MAX_GOAL_SUBSCRIPTIONS} goals. You cannot have anymore.`,
			});
		}

		const gptConfig = GetGamePTConfig(game, playtype);

		const validCriteria = [
			...Object.keys(gptConfig.providedMetrics),
			...Object.keys(gptConfig.derivedMetrics),
		];

		if (!validCriteria.includes(req.body.criteria.key)) {
			return res.status(400).json({
				success: false,
				description: `Invalid criteria '${
					req.body.criteria.key
				}', expected any of ${validCriteria.join(", ")}.`,
			});
		}

		const data = req.safeBody as GoalCreationBody;

		let goal;

		try {
			goal = await ConstructGoal(data.charts, data.criteria, game, playtype);
		} catch (e) {
			const err = e as Error;

			logger.info(err.message, { err });

			return res.status(400).json({
				success: false,
				description: err.message,
			});
		}

		const goalSub = await SubscribeToGoal(user.id, goal, true);

		if (goalSub === SubscribeFailReasons.ALREADY_SUBSCRIBED) {
			return res.status(409).json({
				success: false,
				description: `You are already subscribed to this goal.`,
			});
		}

		if (goalSub === SubscribeFailReasons.ALREADY_ACHIEVED) {
			return res.status(400).json({
				success: false,
				description: `You can't directly assign goals that you would immediately achieve.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Subscribed to ${goal.name}.`,
			body: {
				goal,
				goalSub,
			},
		});
	}
);

const GetGoalSubscription: RequestHandler = async (req, res, next) => {
	const { user, game, playtype } = GetUGPT(req);

	const goalSub = await db["goal-subs"].findOne({
		userID: user.id,
		game,
		playtype,
		goalID: req.params.goalID,
	});

	if (!goalSub) {
		return res.status(404).json({
			success: false,
			description: `${user.username} is not subscribed to this goal.`,
		});
	}

	AssignToReqTachiData(req, { goalSubDoc: goalSub });

	next();
};

/**
 * Reads information about the users subscription to this goal ID.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID
 */
router.get("/:goalID", GetGoalSubscription, async (req, res) => {
	const { user } = GetUGPT(req);

	const goalSub = GetTachiData(req, "goalSubDoc");

	const quests: Array<QuestDocument> = await GetQuestsThatContainGoal(goalSub.goalID);

	const goal = await GetGoalForIDGuaranteed(goalSub.goalID);

	return res.status(200).json({
		success: true,
		description: `Returned information about goal '${goal.name}'.`,
		body: {
			goal,
			goalSub,
			quests,
			user,
		},
	});
});

/**
 * Unsubscribe from a goal.
 *
 * @name DELETE /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID
 */
router.delete(
	"/:goalID",
	RequireAuthedAsUser,
	GetGoalSubscription,
	RequirePermissions("manage_targets"),
	async (req, res) => {
		const goalSub = GetTachiData(req, "goalSubDoc");

		const fail = await UnsubscribeFromGoal(goalSub, false);

		if (fail) {
			switch (fail.reason) {
				case "WAS_STANDALONE":
					// can't happen. mightaswell handle it though.
					return res.status(400).json({
						success: false,
						description: `This goal was assigned by you and can't be removed as a consequence of another action.`,
					});

				case "HAS_QUEST_DEPENDENCIES":
					return res.status(400).json({
						success: false,
						description: `This goal is part of a quest you are subscribed to. It can only be removed by unsubscribing from the relevant quests: ${fail.parentQuests
							.map((e) => `'${e.quest.name}'`)
							.join(", ")}.`,
					});
			}
		}

		return res.status(200).json({
			success: true,
			description: `Removed this goal from your subscriptions.`,
			body: {},
		});
	}
);

export default router;
