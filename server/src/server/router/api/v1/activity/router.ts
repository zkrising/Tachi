import { Router } from "express";
import { GetRecentActivityForMultipleGames } from "lib/activity/activity";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { GetGameConfig } from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve *all* activity across every game on the site.
 *
 * @param session - See CreateActivityRouteHandler
 * @param startTime - See CreateActivityRouteHandler
 *
 * @name GET /api/v1/activity
 */
router.get("/", async (req, res) => {
	const qStartTime = req.query.startTime as string | undefined;

	const startTime = qStartTime ? Number(qStartTime) : null;

	if (Number.isNaN(startTime)) {
		return res.status(400).json({
			success: false,
			description: `Invalid startTime, got a non number.`,
		});
	}

	const gpts = [];

	for (const game of TachiConfig.GAMES) {
		const playtypes = GetGameConfig(game).playtypes;

		for (const playtype of playtypes) {
			gpts.push({ game, playtype, query: {} });
		}
	}

	const data = await GetRecentActivityForMultipleGames(gpts, undefined, startTime);

	return res.status(200).json({
		success: true,
		description: `Returned global activity.`,
		body: data,
	});
});

export default router;
