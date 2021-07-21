import { Router } from "express";
import db from "../../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../../lib/constants/tachi";
import { SearchSessions } from "../../../../../../../../../../lib/search/search";
import { GetGamePTConfig } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Search a users sessions.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	if (typeof req.query.search !== "string") {
		return res.status(400).json({
			success: false,
			description: `Invalid value of ${req.query.search} for search parameter.`,
		});
	}

	const sessions = await SearchSessions(req.query.search, game, playtype, user.id, 100);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns a user's best 100 sessions according to the default statistic
 * for that game.
 *
 * @param alg - An override to specify a different algorithm for that game.
 * UNIMPLEMENTED!!!
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/best
 */
router.get("/best", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	const sessions = await db.sessions.find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			limit: 100,
			sort: {
				[`calculatedData.${gptConfig.defaultSessionRatingAlg}`]: -1,
			},
		}
	);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns a users 100 most recent highlighted sessions. Returned in timeEnded order.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/highlighted
 */
router.get("/highlighted", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const sessions = await db.sessions.find(
		{ userID: user.id, game, playtype, highlight: true },
		{ sort: { timeEnded: -1 }, limit: 100 }
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns a users 100 most recent sessions. Returned in timeEnded order.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/recent
 */
router.get("/recent", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const sessions = await db.sessions.find(
		{ userID: user.id, game, playtype },
		{ sort: { timeEnded: -1 }, limit: 100 }
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${sessions.length} sessions.`,
		body: sessions,
	});
});

export default router;
