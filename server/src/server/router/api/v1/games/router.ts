import gameRouter from "./_game/router";
import { Router } from "express";
import { TachiConfig } from "lib/setup/config";
import { GetGameConfig } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Declares the supported games for this version of tachi.
 * Not sure if this endpoint has any purpose, to be honest.
 *
 * @name GET /api/v1/games
 */
router.get("/", (req, res) => {
	// this line is a bit too 'smart' for its own good, but whatever.
	const configs = Object.fromEntries(TachiConfig.GAMES.map((e) => [e, GetGameConfig(e)]));

	return res.status(200).json({
		success: true,
		description: `Returned support information for ${TachiConfig.GAMES.length} game(s).`,
		body: {
			supportedGames: TachiConfig.GAMES,
			configs,
		},
	});
});

router.use("/:game", gameRouter);

export default router;
