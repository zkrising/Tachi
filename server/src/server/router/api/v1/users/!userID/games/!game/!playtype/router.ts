import { Router } from "express";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import { CheckUserPlayedGamePlaytype } from "./middleware";

const router: Router = Router({ mergeParams: true });

router.use(CheckUserPlayedGamePlaytype);

/**
 * Returns information about a user for this game + playtype.
 * @name GET /api/v1/users/:userID/games/:game/:playtype
 */
router.use("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const stats = req[SYMBOL_TachiData]!.requestedUserGameStats!;

	return res.status(200).json({
		success: true,
		description: `Retrieved user statistics for ${user.username} (${req.params.game} ${req.params.playtype})`,
		body: 
	});
});

export default router;
