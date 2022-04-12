import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import {
	EvaluateMilestoneProgress,
	SubscribeToMilestone,
	UnsubscribeFromMilestone,
} from "lib/targets/milestones";
import { RequirePermissions } from "server/middleware/auth";
import { AssignToReqTachiData, GetGPT, GetUGPT } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import { RequireAuthedAsUser } from "../../../../../middleware";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves this users' set milestones.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const milestoneSubs = await db["milestone-subs"].find({
		userID: user.id,
		game,
		playtype,
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: milestoneSubs.map((e) => e.milestoneID) },
	});

	return res.status(200).json({
		success: true,
		description: `Retrieved ${milestoneSubs.length} milestone(s).`,
		body: {
			milestones,
			milestoneSubs,
		},
	});
});

const GetMilestoneSubscription: RequestHandler = async (req, res, next) => {
	const { user, game, playtype } = GetUGPT(req);

	const milestoneSub = await db["milestone-subs"].findOne({
		userID: user.id,
		game,
		playtype,
		milestoneID: req.params.milestoneID,
	});

	if (!milestoneSub) {
		return res.status(404).json({
			success: false,
			description: `${user.username} is not subscribed to this milestone.`,
		});
	}

	AssignToReqTachiData(req, { milestoneSubDoc: milestoneSub });

	return next();
};

const GetMilestone: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);

	const milestone = await db.milestones.findOne({
		game,
		playtype,
		milestoneID: req.params.milestoneID,
	});

	if (!milestone) {
		return res.status(404).json({
			success: false,
			description: `Can't find a milestone with id '${req.params.milestoneID}'.`,
		});
	}

	AssignToReqTachiData(req, { milestoneDoc: milestone });

	return next();
};

/**
 * Returns this user's progress on this milestone.
 * This also evaluates individual progress on all of the milestones goals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID
 */
router.get("/:milestoneID", GetMilestone, GetMilestoneSubscription, async (req, res) => {
	const { user } = GetUGPT(req);

	const milestoneSub = req[SYMBOL_TachiData]!.milestoneSubDoc!;
	const milestone = req[SYMBOL_TachiData]!.milestoneDoc!;

	// Evaluate each goal for the user. This operation is much faster if the user is
	// subscribed to the milestone (they are), as we can just read their goalSub
	// for each goal.
	const { goalResults: results, goals } = await EvaluateMilestoneProgress(user.id, milestone);

	return res.status(200).json({
		success: true,
		description: `Returned information about ${FormatUserDoc(user)}'s progress on ${
			milestone.name
		}.`,
		body: {
			milestoneSub,
			results,
			goals,
		},
	});
});

/**
 * Subscribe to a milestone.
 *
 * @name PUT /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID
 */
router.put(
	"/:milestoneID",
	RequireAuthedAsUser,
	GetMilestone,
	RequirePermissions("manage_targets"),
	async (req, res) => {
		const { user, game, playtype } = GetUGPT(req);

		const existingMilestonesCount = await db["milestone-subs"].count({
			userID: user.id,
			game,
			playtype,
		});

		if (existingMilestonesCount > ServerConfig.MAX_MILESTONE_SUBSCRIPTIONS) {
			return res.status(400).json({
				success: false,
				description: `You already have ${ServerConfig.MAX_MILESTONE_SUBSCRIPTIONS} milestones. You cannot have anymore for this game.`,
			});
		}

		const milestone = req[SYMBOL_TachiData]!.milestoneDoc!;

		const alreadySubscibed = await db["milestone-subs"].findOne({
			userID: user.id,
			milestoneID: milestone.milestoneID,
		});

		if (alreadySubscibed) {
			return res.status(409).json({
				success: false,
				description: `You are already subscribed to this goal.`,
			});
		}

		const subResult = await SubscribeToMilestone(user.id, milestone, false);

		// Users should be able to subscribe to milestones EVEN IF they would instantly
		// achieve them.

		// if (subResult === SubscribeFailReasons.ALREADY_ACHIEVED) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		description: `You cannot assign a milestone that would be immediately achieved.`,
		// 	});
		// }

		if (subResult === SubscribeFailReasons.ALREADY_SUBSCRIBED) {
			return res.status(409).json({
				success: false,
				description: `You're already subscribed to this milestone.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Subscribed to milestone '${milestone.name}'.`,
			body: subResult,
		});
	}
);

/**
 * Unsubscribe from a milestone.
 *
 * @name DELETE /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID
 */
router.delete(
	"/:milestoneID",
	RequireAuthedAsUser,
	GetMilestone,
	RequirePermissions("manage_targets"),
	async (req, res) => {
		const { user } = GetUGPT(req);
		const milestone = req[SYMBOL_TachiData]!.milestoneDoc!;

		logger.info(
			`User ${FormatUserDoc(user)} is unsubscribing from milestone '${milestone.name}'.`,
			{
				milestone,
				user,
			}
		);

		await UnsubscribeFromMilestone(user.id, milestone);

		return res.status(200).json({
			success: true,
			description: `Unsubscribed from milestone.`,
			body: {
				milestone,
			},
		});
	}
);

export default router;
