import { Router } from "express";
import p from "prudence";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { RequireSelfRequestFromUser } from "../../middleware";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Retrieve all of your configured fervidex cards. Returns null instead
 * of an empty array if no cards are configured.
 *
 * @name GET /api/v1/users/:userID/integrations/fervidex/cards
 */
router.get("/cards", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const cardDoc = await db["fer-cards"].findOne({
		userID: user.id,
	});

	if (!cardDoc || !cardDoc.cards) {
		return res.status(200).json({
			success: true,
			description: `No card filters enabled.`,
			body: null,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Found ${cardDoc.cards.length} card filters.`,
		body: cardDoc.cards,
	});
});

/**
 * Replace your configured fervidex cards. Alternatively, pass null to disable
 * the filter.
 *
 * @param cards - An array of strings or null.
 *
 * @name PUT /api/v1/users/:userID/integrations/fervidex
 */
router.put("/cards", prValidate({ cards: p.nullable(["string"]) }), async (req, res) => {
	if (req.body.cards && req.body.cards.length > 6) {
		return res.status(400).json({
			success: false,
			description: `You cannot have more than 6 card filters at once.`,
		});
	}

	const user = req[SYMBOL_TachiData]!.requestedUser!;

	await db["fer-cards"].update(
		{ userID: user.id },
		{
			$set: {
				cards: req.body.cards,
			},
		},
		{
			upsert: true,
		}
	);

	return res.status(200).json({
		success: true,
		description: `Successfully updated cards.`,
		body: req.body.cards,
	});
});

export default router;
