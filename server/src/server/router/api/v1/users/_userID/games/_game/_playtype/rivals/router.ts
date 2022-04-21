import { Router } from "express";
import { SetRivalsFailReasons } from "lib/constants/err-codes";
import { GetChallengerUsers, GetRivalUsers, SetRivals } from "lib/rivals/rivals";
import p from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import prValidate from "server/middleware/prudence-validate";
import { FormatGame, integer } from "tachi-common";
import { GetUGPT } from "utils/req-tachi-data";
import { RequireAuthedAsUser } from "../../../../middleware";

const router: Router = Router({ mergeParams: true });

/**
 * Returns all of this user's set rivals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/rivals
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const rivals = await GetRivalUsers(user.id, game, playtype);

	return res.status(200).json({
		success: true,
		description: `Returned ${rivals.length} rivals.`,
		body: rivals,
	});
});

/**
 * Sets the user's rivals for this GPT.
 *
 * @param rivalIDs - An array of rivalIDs to set as their rivals.
 *
 * @name PUT /api/v1/users/:userID/games/:game/:playtype/rivals
 */
router.put(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("manage_rivals"),
	prValidate({
		rivalIDs: [p.isPositiveNonZeroInteger],
	}),
	async (req, res) => {
		const rivalIDs: integer[] = req.body.rivalIDs;
		const { user, game, playtype } = GetUGPT(req);

		const result = await SetRivals(user.id, game, playtype, rivalIDs);

		if (result === SetRivalsFailReasons.RIVALED_SELF) {
			return res.status(400).json({
				success: false,
				description: `You cannot rival yourself.`,
			});
		} else if (result === SetRivalsFailReasons.RIVALS_HAVENT_PLAYED_GPT) {
			return res.status(400).json({
				success: false,
				description: `Not all of the rivals you specified have played ${FormatGame(
					game,
					playtype
				)}.`,
			});
		} else if (result === SetRivalsFailReasons.TOO_MANY) {
			return res.status(400).json({
				success: false,
				description: `You can't set more than 5 rivals.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Set ${rivalIDs.length} rivals.`,
			body: {},
		});
	}
);

/**
 * Return all of the users that are rivalling this user for this GPT.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/rivals/challengers
 */
router.get("/challengers", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const challengers = await GetChallengerUsers(user.id, game, playtype);

	return res.status(200).json({
		success: true,
		description: `Returned ${challengers.length} challengers.`,
		body: challengers,
	});
});

export default router;
