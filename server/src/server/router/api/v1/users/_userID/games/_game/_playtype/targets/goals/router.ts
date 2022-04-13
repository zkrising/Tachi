import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { ConstructGoal, SubscribeToGoal } from "lib/targets/goals";
import p from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import prValidate from "server/middleware/prudence-validate";
import { GoalDocument, MilestoneDocument } from "tachi-common";
import { GetGoalForIDGuaranteed, GetMilestoneForIDGuaranteed } from "utils/db";
import { AssignToReqTachiData, GetUGPT } from "utils/req-tachi-data";
import { RequireAuthedAsUser } from "../../../../../middleware";

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

	return res.status(200).json({
		success: true,
		description: `Retrieved ${goalSubs.length} goal(s).`,
		body: {
			goals,
			goalSubs,
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
 * @param criteria.mode - "single", "abs" or "proportion". If abs or proportion, countNum
 * must be supplied.
 * @param criteria.countNum - For abs/proportion mode. Atleast N scores must achieve the
 * key:value condition.
 *
 * @param charts.type - "single", "multi", "folder" or "any".
 * @param charts.data - If *not* "any", an identifier for the set of charts must be
 * supplied here. For single, this is a chartID. For multi, this is an array of chartIDs.
 * For folder, this is a folderID. For any, no data should be supplied.
 *
 * @name POST /api/v1/users/:userID/games/:game/:playtype/targets/goals/add-goal
 */
router.post(
	"/add-goal",
	RequireAuthedAsUser,
	RequirePermissions("manage_targets"),
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
			mode: p.isIn("single", "abs", "proportion"),
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
			type: p.isIn("single", "multi", "folder", "any"),
			data: (self, parent) => {
				if (parent.type === "any") {
					return (
						self === undefined ||
						"Invalid charts.data for type 'any'. Must not have any data!"
					);
				} else if (parent.type === "single") {
					return (
						typeof self === "string" ||
						"Expected a string in charts.data due to charts.type being 'single'."
					);
				} else if (parent.type === "multi") {
					return (
						(Array.isArray(self) &&
							self.every((k) => typeof k === "string") &&
							self.length < 5 &&
							self.length > 1) ||
						"Expected an array of 2 to 5 strings in charts.data due to charts.type being 'multi'."
					);
				} else if (parent.type === "folder") {
					/* istanbul ignore previous */
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

		const data = req.body as GoalCreationBody;

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

		const goalSub = await SubscribeToGoal(user.id, goal);

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

	return next();
};

/**
 * Reads information about the users subscription to this goal ID.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID
 */
router.get("/:goalID", GetGoalSubscription, async (req, res) => {
	const { user } = GetUGPT(req);

	const goalSub = req[SYMBOL_TachiData]!.goalSubDoc!;

	let milestones: MilestoneDocument[] = [];

	if (goalSub.parentMilestones.length !== 0) {
		milestones = await Promise.all(
			goalSub.parentMilestones.map((e) => GetMilestoneForIDGuaranteed(e))
		);
	}

	const goal = await GetGoalForIDGuaranteed(goalSub.goalID);

	return res.status(200).json({
		success: true,
		description: `Returned information about goal '${goal.name}'.`,
		body: {
			goal,
			goalSub,
			milestones,
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
		const goalID = req.params.goalID;
		const { user, game, playtype } = GetUGPT(req);

		const goalSub = await db["goal-subs"].findOne({
			goalID,
			userID: user.id,
			game,
			playtype,
		});

		if (!goalSub) {
			return res.status(400).json({
				success: false,
				description: `You aren't subscribed to this goal.`,
			});
		}

		if (goalSub.parentMilestones.length) {
			return res.status(400).json({
				success: false,
				description: `This goal is part of a milestone you are subscribed to. It can only be removed by unsubscribing from the relevant milestones.`,
			});
		}

		await db["goal-subs"].remove({
			userID: user.id,
			goalID,
			game,
			playtype,
		});

		return res.status(200).json({
			success: true,
			description: `Removed this goal from your subscriptions.`,
			body: {},
		});
	}
);

export default router;
