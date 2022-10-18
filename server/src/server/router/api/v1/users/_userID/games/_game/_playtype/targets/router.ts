import goalsRouter from "./goals/router";
import questsRouter from "./quests/router";
import { Router } from "express";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedQuests,
	GetRecentlyInteractedGoals,
	GetRecentlyInteractedQuests,
} from "utils/db";
import { GetUGPT } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Return a user's recently achieved goals and quests.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyAchievedGoals({ userID, game, playtype }),
		GetRecentlyAchievedQuests({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			quests,
			goalSubs,
			questSubs,
			user,
		},
	});
});

/**
 * Returns a user's recently interacted with (raised, etc.) goals and quests.
 * Note that this does not include recently achieved.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-raised
 */
router.get("/recently-raised", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyInteractedGoals({ userID, game, playtype }),
		GetRecentlyInteractedQuests({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			quests,
			goalSubs,
			questSubs,
			user,
		},
	});
});

router.use("/goals", goalsRouter);
router.use("/quests", questsRouter);

export default router;
