import { RequireSelfRequestFromUser } from "../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express-serve-static-core";
import type { CGCardInfo } from "tachi-common";

const router: Router = Router({ mergeParams: true });

const ValidateCGType: RequestHandler = (req, res, next) => {
	if (req.params.cgType === "dev" || req.params.cgType === "prod") {
		next();
		return;
	}

	return res.status(404).json({
		success: false,
		description: `No such service 'cg/${req.params.cgType}' is supported.`,
	});
};

/**
 * Retrieve this user's card info (cardID).
 *
 * @name GET /api/v1/users/:userID/integrations/cg/:cgType
 */
router.get("/", ValidateCGType, RequireSelfRequestFromUser, async (req, res) => {
	const user = GetTachiData(req, "requestedUser");
	const cgType = req.params.cgType as "dev" | "prod";

	const cardInfo = await db["cg-card-info"].findOne({
		userID: user.id,
		service: cgType,
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
 * Write new card details for this CG integration.
 *
 * @name PUT /api/v1/users/:userID/integrations/cg/:cgType
 */
router.put(
	"/",
	ValidateCGType,
	RequireSelfRequestFromUser,
	prValidate(
		{
			cardID: p.regex(/^[a-zA-Z0-9]{16}$/u),
			pin: p.regex(/^[0-9]{4}$/u),
		},
		{
			cardID: "Expected 16 characters.",
			pin: "Expected 4 digits.",
		}
	),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");
		const cgType = req.params.cgType as "dev" | "prod";

		const { cardID, pin } = req.safeBody as {
			cardID: string;
			pin: string;
		};

		const newCardInfo: CGCardInfo = {
			service: cgType,
			cardID,
			pin,
			userID: user.id,
		};

		await db["cg-card-info"].update(
			{
				userID: user.id,
				service: cgType,
			},
			{ $set: newCardInfo },
			{
				// insert new card info if the user doesn't have it yet.
				upsert: true,
			}
		);

		return res.status(200).json({
			success: true,
			description: `Updated cardID and pin.`,
			body: {},
		});
	}
);

/**
 * Unset this user's card details for this CG integration.
 *
 * @name DELETE /api/v1/users/:userID/integrations/cg/:cgType
 */
router.delete("/", ValidateCGType, RequireSelfRequestFromUser, async (req, res) => {
	const user = GetTachiData(req, "requestedUser");
	const cgType = req.params.cgType as "dev" | "prod";

	await db["cg-card-info"].remove({
		userID: user.id,
		service: cgType,
	});

	return res.status(200).json({
		success: true,
		description: `Deleted stored card info.`,
		body: {},
	});
});

export default router;
