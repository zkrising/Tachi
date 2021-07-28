import { Router } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { GetGameConfig } from "tachi-common";
import { ValidateGameFromParam } from "./middleware";
import playtypeRouter from "./_playtype/router";

const router: Router = Router({ mergeParams: true });

router.use(ValidateGameFromParam);

/**
 * Returns the configuration for this game.
 *
 * @name GET /api/v1/games/:game
 */
router.get("/", (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;

	return res.status(200).json({
		success: true,
		description: `Returned information for ${game}`,
		body: GetGameConfig(game),
	});
});

router.use("/:playtype", playtypeRouter);

export default router;
