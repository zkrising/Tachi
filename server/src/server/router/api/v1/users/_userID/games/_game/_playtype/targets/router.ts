import { Router } from "express";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedMilestones,
	GetRecentlyInteractedGoals,
	GetRecentlyInteractedMilestones,
} from "utils/db";
import { GetUGPT } from "utils/req-tachi-data";
import goalsRouter from "./goals/router";
import milestonesRouter from "./milestones/router";

const router: Router = Router({ mergeParams: true });

/**
 * Return a user's recently achieved goals and milestones.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { milestones, milestoneSubs }] = await Promise.all([
		GetRecentlyAchievedGoals({ userID, game, playtype }),
		GetRecentlyAchievedMilestones({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			milestones,
			goalSubs,
			milestoneSubs,
			user,
		},
	});
});

/**
 * Returns a user's recently interacted with (raised, etc.) goals and milestones.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-interacted
 */
router.get("/recently-interacted", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { milestones, milestoneSubs }] = await Promise.all([
		GetRecentlyInteractedGoals({ userID, game, playtype }),
		GetRecentlyInteractedMilestones({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			milestones,
			goalSubs,
			milestoneSubs,
			user,
		},
	});
});

router.use("/goals", goalsRouter);
router.use("/milestones", milestonesRouter);

export default router;
