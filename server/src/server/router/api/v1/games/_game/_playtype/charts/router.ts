import chartIDRouter from "./_chartID/router";
import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { SearchGameSongs } from "lib/search/search";
import { IsString } from "utils/misc";
import { FindChartsOnPopularity } from "utils/queries/charts";
import { GetGPT } from "utils/req-tachi-data";
import type { ChartDocument, UGPTSettings } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Searches for charts on this game - if no search parameter is given,
 * returns the 100 most popular charts for this game.
 *
 * @param search - The song title to match on.
 * @param noIntelligentOmit - If present, will not perform intelligent
 * chart omissions from results.
 *
 * @name GET /api/v1/games/:game/:playtype/charts
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	let songIDs;

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
	// to see 2dxtra charts, we need to remove them from the
	// result of a search.
	//
	// Since most players will have this off, this is not a significant
	// performance hit.
	if (game === "iidx" && req.query.noIntelligentOmit === undefined) {
		if (req[SYMBOL_TACHI_API_AUTH].userID === null) {
			charts = charts.filter(
				(e) => (e as ChartDocument<"iidx:DP" | "iidx:SP">).data["2dxtraSet"] === null
			);
		} else {
			const iidxSettings = (await db["game-settings"].findOne({
				userID: req[SYMBOL_TACHI_API_AUTH].userID!,
				game,
				playtype,
			})) as UGPTSettings<"iidx:DP" | "iidx:SP"> | null;

			if (!iidxSettings || !iidxSettings.preferences.gameSpecific.display2DXTra) {
				charts = charts.filter(
					(e) => (e as ChartDocument<"iidx:DP" | "iidx:SP">).data["2dxtraSet"] === null
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
