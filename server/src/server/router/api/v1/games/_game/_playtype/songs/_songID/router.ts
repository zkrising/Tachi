import { ValidateAndGetSong } from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { GetGPT, GetTachiData } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

router.use(ValidateAndGetSong);

/**
 * Returns the song at this ID and its child chart documents.
 *
 * @name GET /api/v1/games/:game/:playtype/songs/:songID
 */
router.get("/", async (req, res) => {
	const song = GetTachiData(req, "songDoc");
	const { game, playtype } = GetGPT(req);

	const charts = await db.charts[game].find({
		songID: song.id,
		playtype,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${charts.length} charts for song ${song.title}.`,
		body: {
			song,
			charts,
		},
	});
});

export default router;
