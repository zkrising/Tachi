import goalsRouter from "./goals/router";
import questlineRouter from "./questlines/router";
import questsRouter from "./quests/router";
import { Router } from "express";
import { FormatGame } from "tachi-common";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedQuests,
	GetRecentlyInteractedGoals,
	GetRecentlyInteractedQuests,
} from "utils/db";
import { GetGPT } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve all of this game's recently achieved goals and quests.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyAchievedGoals({ game, playtype }),
		GetRecentlyAchievedQuests({ game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved some recently achieved targets for ${FormatGame(game, playtype)}`,
		body: {
			goals,
			goalSubs,
			quests,
			questSubs,
		},
	});
});

/**
 * Retrieve all of this game's recently interacted-with goals and quests.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/recently-raised
 */
router.get("/recently-raised", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyInteractedGoals({ game, playtype }),
		GetRecentlyInteractedQuests({ game, playtype }),
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
			quests,
			questSubs,
		},
	});
});

router.use("/goals", goalsRouter);
router.use("/quests", questsRouter);
router.use("/questlines", questlineRouter);

export default router;
