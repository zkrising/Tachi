import { Router } from "express";
import { GetPBsForJubility } from "lib/score-import/framework/user-game-stats/rating";
import { GetRelevantSongsAndCharts } from "utils/db";
import { GetUser } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve the PBs that went into this users jubility ranking.
 *
 * @name GET /api/v1/users/:userID/games/jubeat/Single/jubility
 */
router.get("/Single/jubility", async (req, res) => {
	const user = GetUser(req);

	const { bestHotScores, bestScores } = await GetPBsForJubility(user.id);

	const { songs, charts } = await GetRelevantSongsAndCharts(
		[...bestHotScores, ...bestScores],
		"jubeat"
	);

	return res.status(200).json({
		success: true,
		description: `Retrieved scores that went into this users jubility.`,
		body: {
			songs,
			charts,
			pickUp: bestHotScores,
			other: bestScores,
		},
	});
});

export default router;
