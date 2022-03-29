import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";
import p from "prudence";
import { GoalDocument } from "tachi-common";
import { ConstructGoal, SubscribeFailReasons, SubscribeToGoal } from "lib/targets/goals";
import CreateLogCtx from "lib/logger/logger";
import { RequirePermissions } from "server/middleware/auth";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { GetGoalForIDGuaranteed, GetMilestoneForIDGuaranteed } from "utils/db";
import { RequireAuthedAsUser } from "../../../../../middleware";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Retrieves this users' set goals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/goals
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

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
					return (
						typeof self === "string" ||
						"Expected a string in charts.data due to charts.type being 'folder'."
					);
				}

				return "Unknown charts.type.";
			},
		},
	}),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;

		const existingGoalsCount = await db["goal-subs"].count({
			userID: user.id,
			game,
			playtype,
		});

		if (existingGoalsCount > 1_000) {
			return res.status(400).json({
				success: false,
				description: `You already have 1000 goals. You cannot have anymore.`,
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

		const goalSub = await SubscribeToGoal(user.id, goal, { origin: "manual" });

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const goalSub = req[SYMBOL_TachiData]!.goalSubDoc!;

	let milestone = null;

	if (goalSub.from.origin === "milestone") {
		milestone = await GetMilestoneForIDGuaranteed(goalSub.from.milestoneID);
	}

	const goal = await GetGoalForIDGuaranteed(goalSub.goalID);

	return res.status(200).json({
		success: true,
		description: `Returned information about goal ${goal.name}.`,
		body: {
			goal,
			goalSub,
			milestone,
			user,
		},
	});
});

/**
 * Removes a goal from your profile.
 *
 * @name DELETE /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID
 */
router.delete(
	"/:goalID",
	RequireAuthedAsUser,
	GetGoalSubscription,
	RequirePermissions("manage_targets"),
	prValidate({ goalID: "string" }),
	async (req, res) => {
		const goalID = req.params.goalID;
		const user = req[SYMBOL_TachiData]!.requestedUser!;
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;

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

		if (goalSub.from.origin === "milestone") {
			return res.status(400).json({
				success: false,
				description: `This goal is from a milestone. You can't remove it directly, only by removing the parent milestone.`,
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
