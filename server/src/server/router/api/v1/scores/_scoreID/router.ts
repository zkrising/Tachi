import { Router } from "express";
import db from "../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../lib/constants/tachi";
import CreateLogCtx from "../../../../../../lib/logger/logger";
import { GetUserWithID } from "../../../../../../utils/user";
import { GetScoreFromParam } from "./middleware";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.use(GetScoreFromParam);

/**
 * Retrieve the score document at this ID.
 *
 * @param getRelated - Gets the related song and chart document for this score, aswell.
 *
 * @name GET /api/v1/scores/:scoreID
 */
router.get("/", async (req, res) => {
	const score = req[SYMBOL_TachiData]!.scoreDoc!;

	if (req.query.getRelated) {
		const [user, chart, song] = await Promise.all([
			GetUserWithID(score.userID),
			db.charts[score.game].findOne({ chartID: score.chartID }),
			db.songs[score.game].findOne({ id: score.songID }),
		]);

		if (!user || !chart || !song) {
			logger.error(
				`Score ${
					score.scoreID
				} refers to non-existant data: [user,chart,song] [${!!user} ${!!chart} ${!!song}]`
			);

			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Returned score.`,
			body: {
				score,
				user,
				song,
				chart,
			},
		});
	}

	return res.status(200).json({
		success: true,
		description: `Returned score.`,
		body: {
			score,
		},
	});
});

export default router;
