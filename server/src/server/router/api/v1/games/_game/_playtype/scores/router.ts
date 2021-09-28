import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";
import p from "prudence";
import { GetUsersWithIDs } from "utils/user";
import { GetRelevantSongsAndCharts } from "utils/db";

const router: Router = Router({ mergeParams: true });

/**
 * Return the most recent highlighted scores for this game.
 *
 * @param limit - Return up to this amount. Caps at 100, defaults to 10.
 *
 * @name GET /api/v1/games/:game/:playtype/scores/highlighted
 */
router.get(
	"/highlighted",
	prValidate({
		limit: p.optional((self) => p.isBoundedInteger(1, 500)(Number(self))),
	}),
	async (req, res) => {
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;

		const limit = req.query.limit ? Number(req.query.limit) : 10;

		const scores = await db.scores.find(
			{
				game,
				playtype,
				highlight: true,
			},
			{
				limit,
				sort: { timeAchieved: -1 },
			}
		);

		const users = await GetUsersWithIDs(scores.map((e) => e.userID));

		const { songs, charts } = await GetRelevantSongsAndCharts(scores, game);

		return res.status(200).json({
			success: true,
			description: `Returned ${scores.length} scores.`,
			body: {
				scores,
				users,
				songs,
				charts,
			},
		});
	}
);

export default router;
