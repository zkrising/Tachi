import chartIDRouter from "./_chartID/router";
import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { SearchGameSongs } from "lib/search/search";
import { IsString } from "utils/misc";
import { FindChartsOnPopularity } from "utils/queries/charts";
import { GetGPT } from "utils/req-tachi-data";
import type { ChartDocument, integer, UGPTSettings } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Searches for charts on this game - if no search parameter is given,
 * returns the 100 most popular charts for this game.
 *
 * @param search - The song title to match on.
 * @param noIntelligentOmit - If present, will not perform intelligent
 * chart omissions from results.
 * @param requesterHasPlayed - If present, will only return charts the
 * requesting user has a PB on. If this request doesn't belong to a user,
 * this returns 401.
 *
 * @name GET /api/v1/games/:game/:playtype/charts
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	let songIDs: Array<integer> | undefined;

	if (IsString(req.query.search)) {
		const songs = await SearchGameSongs(game, req.query.search, 100);

		songIDs = songs.map((e) => e.id);
	}

	if (IsString(req.query.requesterHasPlayed)) {
		const userID = req[SYMBOL_TACHI_API_AUTH].userID;

		if (userID === null) {
			return res.status(401).json({
				success: false,
				description: `You must be authorised as a user to use the requesterHasPlayed option.`,
			});
		}

		const playedSongs = (
			await db["personal-bests"].find(
				{ userID, game, playtype },
				{ projection: { songID: 1 } }
			)
		).map((e) => e.songID);

		if (songIDs) {
			songIDs = songIDs.filter((e) => playedSongs.includes(e));
		} else {
			songIDs = playedSongs;
		}
	}

	const skip = 0;
	const limit = 100;

	let charts = await FindChartsOnPopularity(
		game,
		playtype,

		// if empty, we want the set of all songs. Otherwise, constrict input.
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
