import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves this users' set milestones
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const userMilestones = await db["user-milestones"].find({
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

export default router;
