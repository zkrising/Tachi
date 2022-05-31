import playtypeRouter from "./_playtype/router";
import { ValidateGameFromParam } from "./middleware";
import { Router } from "express";
import { GetGameConfig } from "tachi-common";
import { GetTachiData } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

router.use(ValidateGameFromParam);

/**
 * Returns the configuration for this game.
 *
 * @name GET /api/v1/games/:game
 */
router.get("/", (req, res) => {
	const game = GetTachiData(req, "game");

	return res.status(200).json({
		success: true,
		description: `Returned information for ${game}`,
		body: GetGameConfig(game),
	});
});

router.use("/:playtype", playtypeRouter);

export default router;
