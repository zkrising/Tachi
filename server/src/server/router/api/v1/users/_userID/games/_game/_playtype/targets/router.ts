import { Router } from "express";
import db from "external/mongo/db";
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

	const recentlyAchievedGoalSubs = await db["goal-subs"].find(
		{
			game,
			playtype,
			achieved: true,
			wasInstantlyAchieved: false,
			userID,
		},
		{
			sort: {
				timeAchieved: -1,
			},
			limit: 50,
		}
	);

	const recentlyAchievedMilestoneSubs = await db["milestone-subs"].find(
		{
			game,
			playtype,
			achieved: true,
			wasInstantlyAchieved: false,
			userID,
		},
		{
			sort: {
				timeAchieved: -1,
			},
			limit: 10,
		}
	);

	const goals = await db.goals.find({
		goalID: { $in: recentlyAchievedGoalSubs.map((e) => e.goalID) },
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: recentlyAchievedMilestoneSubs.map((e) => e.milestoneID) },
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			milestones,
			goalSubs: recentlyAchievedGoalSubs,
			milestoneSubs: recentlyAchievedMilestoneSubs,
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

	const recentlyAchievedGoalSubs = await db["goal-subs"].find(
		{
			game,
			playtype,
			wasInstantlyAchieved: false,
			userID,
			lastInteraction: { $ne: null },
		},
		{
			sort: {
				lastInteraction: -1,
			},
			limit: 50,
		}
	);

	const recentlyAchievedMilestoneSubs = await db["milestone-subs"].find(
		{
			game,
			playtype,
			wasInstantlyAchieved: false,
			userID,
			lastInteraction: { $ne: null },
		},
		{
			sort: {
				lastInteraction: -1,
			},
			limit: 10,
		}
	);

	const goals = await db.goals.find({
		goalID: { $in: recentlyAchievedGoalSubs.map((e) => e.goalID) },
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: recentlyAchievedMilestoneSubs.map((e) => e.milestoneID) },
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			milestones,
			goalSubs: recentlyAchievedGoalSubs,
			milestoneSubs: recentlyAchievedMilestoneSubs,
			user,
		},
	});
});

router.use("/goals", goalsRouter);
router.use("/milestones", milestonesRouter);

export default router;
