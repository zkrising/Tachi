import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import {
	CalculateMilestoneOutOf,
	EvaluateMilestoneProgress,
	GetGoalsInMilestone,
} from "lib/targets/milestones";
import { RequirePermissions } from "server/middleware/auth";
import { UserMilestoneDocument } from "tachi-common";
import { GetMilestoneForIDGuaranteed } from "utils/db";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";

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

	const userMilestones = await db["milestone-subs"].find({
		userID: user.id,
		game,
		playtype,
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: userMilestones.map((e) => e.milestoneID) },
	});

	return res.status(200).json({
		success: true,
		description: `Retrieved ${userMilestones.length} milestone(s)`,
		body: {
			milestones,
			userMilestones,
		},
	});
});

const GetMilestoneSubscription: RequestHandler = async (req, res, next) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const userMilestone = await db["milestone-subs"].findOne({
		userID: user.id,
		game,
		playtype,
		milestoneID: req.params.milestoneID,
	});

	if (!userMilestone) {
		return res.status(404).json({
			success: false,
			description: `${user.username} is not subscribed to this milestone.`,
		});
	}

	AssignToReqTachiData(req, { userMilestoneDoc: userMilestone });

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
	const userMilestone = req[SYMBOL_TachiData]!.userMilestoneDoc!;

	const milestone = await GetMilestoneForIDGuaranteed(userMilestone.milestoneID);

	const { progress, results, goals } = await EvaluateMilestoneProgress(user.id, milestone);

	return res.status(200).json({
		success: true,
		description: `Returned information about ${FormatUserDoc(user)}'s progress on ${
			milestone.name
		}.`,
		body: {
			userMilestone,
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
router.put("/:milestoneID", RequirePermissions(""), async (req, res) => {
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

	const { progress, outOf, achieved } = await EvaluateMilestoneProgress(user.id, milestone);

	if (achieved) {
		return res.status(400).json({
			success: false,
			description: `You cannot assign a milestone that would be immediately achieved.`,
		});
	}

	const userMilestone: UserMilestoneDocument = {
		achieved,
		game,
	};
});

export default router;
