import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import { rootLogger } from "lib/logger/logger";
import { SearchGameSongs } from "lib/search/search";
import { ChartDocument } from "tachi-common";
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

	let charts = await FindChartsOnPopularity(
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

	// Edge case.
	// If the game is IIDX and the player does not want
	// to see 2dxtra charts, we need to remve them from the
	// result of a search.
	//
	// Since most players will have this off, this is not a significant
	// performance hit.
	if (game === "iidx") {
		if (!req[SYMBOL_TachiAPIAuth].userID) {
			charts = charts.filter(
				(e) => (e as ChartDocument<"iidx:SP" | "iidx:DP">).data["2dxtraSet"] === null
			);
		} else {
			const iidxSettings = await db["game-settings"].findOne({
				userID: req[SYMBOL_TachiAPIAuth].userID!,
				game,
				playtype,
			});

			if (!iidxSettings || !iidxSettings.preferences.gameSpecific.display2DXTra) {
				charts = charts.filter(
					(e) => (e as ChartDocument<"iidx:SP" | "iidx:DP">).data["2dxtraSet"] === null
				);
			}
		}
	}

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
