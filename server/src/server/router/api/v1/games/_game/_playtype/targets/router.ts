import { Router } from "express";
import { FormatGame } from "tachi-common";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedMilestones,
	GetRecentlyInteractedGoals,
	GetRecentlyInteractedMilestones,
} from "utils/db";
import { GetGPT } from "utils/req-tachi-data";
import goalsRouter from "./goals/router";
import milestonesRouter from "./milestones/router";
import milestoneSetsRouter from "./milestone-sets/router";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve all of this game's recently achieved goals and milestones.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const [{ goals, goalSubs }, { milestones, milestoneSubs }] = await Promise.all([
		GetRecentlyAchievedGoals({ game, playtype }),
		GetRecentlyAchievedMilestones({ game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved some recently achieved targets for ${FormatGame(game, playtype)}`,
		body: {
			goals,
			goalSubs,
			milestones,
			milestoneSubs,
		},
	});
});

/**
 * Retrieve all of this game's recently interacted-with goals and milestones.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/recently-raised
 */
router.get("/recently-raised", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const [{ goals, goalSubs }, { milestones, milestoneSubs }] = await Promise.all([
		GetRecentlyInteractedGoals({ game, playtype }),
		GetRecentlyInteractedMilestones({ game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved some recently interacted-with targets for ${FormatGame(
			game,
			playtype
		)}`,
		body: {
			goals,
			goalSubs,
			milestones,
			milestoneSubs,
		},
	});
});

router.use("/goals", goalsRouter);
router.use("/milestones", milestonesRouter);
router.use("/milestone-sets", milestoneSetsRouter);

export default router;
