import { Router } from "express";
import { CONF_INFO } from "lib/setup/config";
import { GetGameConfig } from "tachi-common";
import gameRouter from "./_game/router";

const router: Router = Router({ mergeParams: true });

/**
 * Declares the supported games for this version of tachi.
 * Not sure if this endpoint has any purpose, to be honest.
 *
 * @name GET /api/v1/games
 */
router.get("/", (req, res) => {
	// this line is a bit too 'smart' for its own good, but whatever.
	const configs = Object.fromEntries(CONF_INFO.supportedGames.map((e) => [e, GetGameConfig(e)]));

	return res.status(200).json({
		success: true,
		description: `Returned support information for ${CONF_INFO.supportedGames.length} game(s).`,
		body: {
			supportedGames: CONF_INFO.supportedGames,
			configs,
		},
	});
});

router.use("/:game", gameRouter);

export default router;
