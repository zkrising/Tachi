import { RequireSelfRequestFromUser } from "../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { GetMAITAuth, RevokeMAITAuth } from "utils/queries/auth";
import { GetTachiData } from "utils/req-tachi-data";
import type { MAITAuthDocument } from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi, RequireSelfRequestFromUser);

/**
 * Return the authentication status for MAIT
 * @note - Express's types infer arg0 of "/" to mean no params, for some reason.
 * the <any> generic overrides this behaviour.
 *
 * @name GET /api/v1/users/:userID/integrations/mait
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get<any>("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const authDoc = await GetMAITAuth(user.id);

	return res.status(200).json({
		success: true,
		description: authDoc ? `User is authenticated.` : `User is unauthenticated.`,
		body: {
			authStatus: !!authDoc,
		},
	});
});

/**
 * Revoke your authentication for MAIT.
 * @note - Express's types infer arg0 of "/" to mean no params, for some reason.
 * the <any> generic overrides this behaviour.
 *
 * @name DELETE /api/v1/users/:userID/integrations/mait
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.delete<any>("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const authDoc = await GetMAITAuth(user.id);

	if (!authDoc) {
		return res.status(409).json({
			success: false,
			description: `You are not authorised with this service.`,
		});
	}

	await RevokeMAITAuth(user.id);

	return res.status(200).json({
		success: true,
		description: `Revoked authentication for MAIT.`,
		body: {},
	});
});

/**
 * Write new API token for this MAIT integration.
 *
 * @name PUT /api/v1/users/:userID/integrations/mait
 */
router.put(
	"/",
	prValidate({
		token: "string",
	}),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");

		const { token } = req.safeBody as { token: string };

		const newAuthDoc: MAITAuthDocument = {
			userID: user.id,
			token,
		};

		await db["mait-auth-tokens"].update(
			{
				userID: user.id,
			},
			{
				$set: newAuthDoc,
			},
			{
				// insert new token if the user doesn't have it yet.
				upsert: true,
			}
		);

		return res.status(200).json({
			success: true,
			description: `Updated token.`,
			body: {},
		});
	}
);

export default router;
