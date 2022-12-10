import { RequireSelfRequestFromUser } from "../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { DeleteUndefinedProps } from "utils/misc";
import { optNull } from "utils/prudence";
import { GetTachiData } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Retrieve your KsHook SV6C settings.
 *
 * @name GET /api/v1/users/:userID/integrations/kshook-sv6c/settings
 */
router.get("/settings", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const settingsDoc = await db["kshook-sv6c-settings"].findOne({
		userID: user.id,
	});

	return res.status(200).json({
		success: true,
		description: `Retrieved KsHook (S6VC) settings.`,
		body: settingsDoc ?? null,
	});
});

/**
 * Update your KsHook SV6C configuration.
 *
 * @param forceStaticImport - Whether or whether not to statically import data.
 *
 * @name PUT /api/v1/users/:userID/integrations/kshook-sv6c/settings
 */
router.patch("/settings", prValidate({ forceStaticImport: "boolean" }), async (req, res) => {
	const body = req.safeBody as {
		forceStaticImport: boolean;
	};

	const user = GetTachiData(req, "requestedUser");

	await db["kshook-sv6c-settings"].update(
		{ userID: user.id },
		{
			$set: {
				forceStaticImport: body.forceStaticImport,
			},
		},
		{
			upsert: true,
		}
	);

	const settings = await db["kshook-sv6c-settings"].findOne({ userID: user.id });

	return res.status(200).json({
		success: true,
		description: `Successfully updated settings.`,
		body: settings,
	});
});

export default router;
