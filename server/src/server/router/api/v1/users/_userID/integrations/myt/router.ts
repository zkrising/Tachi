import { RequireSelfRequestFromUser } from "../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { p } from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { GetTachiData } from "utils/req-tachi-data";
import type { MytCardInfo } from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Retrieve this user's card info (cardAccessCode).
 *
 * @name GET /api/v1/users/:userID/integrations/myt
 */
router.get("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const cardInfo = await db["myt-card-info"].findOne({
		userID: user.id,
	});

	if (!cardInfo) {
		return res.status(200).json({
			success: true,
			description: `User has no card info set.`,
			body: null,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Found card info.`,
		body: cardInfo,
	});
});

/**
 * Write new card details for Myt.
 *
 * @name PUT /api/v1/users/:userID/integrations/myt
 */
router.put(
	"/",
	prValidate(
		{ cardAccessCode: p.regex(/^[0-9]{20}$/u) },
		{ cardAccessCode: "Expected 20 digits." }
	),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");

		const { cardAccessCode } = req.safeBody as { cardAccessCode: string };

		const newCardInfo: MytCardInfo = {
			userID: user.id,
			cardAccessCode,
		};

		await db["myt-card-info"].update(
			{ userID: user.id },
			{ $set: newCardInfo },
			{
				// insert new card info if the user doesn't have it yet.
				upsert: true,
			}
		);

		return res.status(200).json({
			success: true,
			description: `Updated cardAccessCode.`,
			body: {},
		});
	}
);

/**
 * Unset this user's card details for Myt.
 *
 * @name DELETE /api/v1/users/:userID/integrations/myt
 */
router.delete("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	await db["cg-card-info"].remove({ userID: user.id });

	return res.status(200).json({
		success: true,
		description: `Deleted stored card info.`,
		body: {},
	});
});

export default router;
