import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import {
	EvaluateMilestoneProgress,
	SubscribeToMilestone,
} from "lib/targets/milestones";
import { RequirePermissions } from "server/middleware/auth";
import { MilestoneSubscriptionDocument } from "tachi-common";
import { GetMilestoneForIDGuaranteed } from "utils/db";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { FormatUserDoc, GetUserWithID } from "utils/user";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves this users' set milestones.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

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
		description: `Retrieved ${milestoneSubs.length} milestone(s)`,
		body: {
			milestones,
			milestoneSubs,
		},
	});
});

const GetMilestoneSubscription: RequestHandler = async (req, res, next) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

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

/**
 * Returns this user's progress on this milestone.
 * This also evaluates individual progress on all of the milestones goals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID
 */
router.get("/:milestoneID", GetMilestoneSubscription, async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const milestoneSub = req[SYMBOL_TachiData]!.milestoneSubDoc!;

	const milestone = await GetMilestoneForIDGuaranteed(milestoneSub.milestoneID);

	const {
		progress,
		goalResults: results,
		goals,
	} = await EvaluateMilestoneProgress(user.id, milestone);

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
router.put("/:milestoneID", RequirePermissions("manage_targets"), async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const existingMilestonesCount = await db["milestone-subs"].count({
		userID: user.id,
		game,
		playtype,
	});

	if (existingMilestonesCount > 100) {
		return res.status(400).json({
			success: false,
			description: `You already have 100 milestones. You cannot have anymore for this game.`,
		});
	}

	const milestone = await db.milestones.findOne({
		milestoneID: req.params.milestoneID,
		game,
		playtype,
	});

	if (!milestone) {
		return res.status(404).json({
			success: false,
			description: `A milestone with the ID ${req.params.milestoneID} does not exist.`,
		});
	}

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

	const x = await SubscribeToMilestone(user.id, milestone);

	if (achieved) {
		return res.status(400).json({
			success: false,
			description: `You cannot assign a milestone that would be immediately achieved.`,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Subscribed to milestone '${milestone.name}'.`,
		body: 
	});
});

export default router;
