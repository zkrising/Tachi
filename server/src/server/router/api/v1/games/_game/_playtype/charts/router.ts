import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchGameSongs } from "lib/search/search";
import { IsString } from "utils/misc";
import { FindChartsOnPopularity } from "utils/queries/charts";
import chartIDRouter from "./_chartID/router";

const router: Router = Router({ mergeParams: true });

/**
 * Searches for charts on this game - if no search parameter is given,
 * returns the 100 most popular charts for this game.
 *
 * @param search - The song title to match on.
 *
 * @name GET /api/v1/games/:game/:playtype/charts
 */
router.get("/", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	let songIDs = undefined;

	if (IsString(req.query.search)) {
		const songs = await SearchGameSongs(game, req.query.search, 100);
		songIDs = songs.map((e) => e.id);
	}

	const skip = 0;
	const limit = 100;

	const charts = await FindChartsOnPopularity(
		game,
		playtype,
		songIDs,
		skip,
		limit,
		"personal-bests"
	);

	// @optimisable
	// could use songIDs from above instead of refetching
	// but this is not very expensive.
	const songs = await db.songs[game].find({
		id: { $in: charts.map((e) => e.songID) },
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${charts.length} charts.`,
		body: {
			charts,
			songs,
		},
	});
});

router.use("/:chartID", chartIDRouter);

export default router;
