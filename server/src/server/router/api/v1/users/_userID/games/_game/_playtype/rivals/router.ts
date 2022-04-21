import { Router } from "express";
import { GetChallengerUsers, GetRivalUsers, SetRivals } from "lib/rivals/rivals";
import prValidate from "server/middleware/prudence-validate";
import { GetUGPT } from "utils/req-tachi-data";
import { RequireAuthedAsUser, RequireSelfRequestFromUser } from "../../../../middleware";
import p from "prudence";
import { integer } from "tachi-common";
import { RequirePermissions } from "server/middleware/auth";

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

		if (rivalIDs.length > 5) {
			return res.status(400).json({
				success: false,
				description: `You can only set up to 5 rivals.`,
			});
		}

		if (rivalIDs.some((e) => e === user.id)) {
			return res.status(400).json({
				success: false,
				description: `You cannot rival yourself.`,
			});
		}

		await SetRivals(user.id, game, playtype, rivalIDs);

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
