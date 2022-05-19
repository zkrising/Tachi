/* eslint-disable no-await-in-loop */
import { RequireSelfRequestFromUser } from "../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { IsNonEmptyString } from "utils/misc";
import { GetArcAuth } from "utils/queries/auth";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Return this users integration status for ARC.
 * @name GET /api/v1/users/:userID/integrations/arc
 */
router.get("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const [iidx, sdvx] = await Promise.all([
		GetArcAuth(user.id, "api/arc-iidx"),
		GetArcAuth(user.id, "api/arc-sdvx"),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved integration information for ARC.`,
		body: {
			iidx,
			sdvx,
		},
	});
});

/**
 * Modify this users integrations for ARC.
 * @name PATCH /api/v1/users/:userID/integrations/arc
 */
router.patch("/", prValidate({ iidx: "*?string", sdvx: "*?string" }), async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const body = req.safeBody as {
		iidx?: string | null;
		sdvx?: string | null;
	};

	if (Object.keys(body).length === 0) {
		return res.status(400).json({
			success: false,
			description: `Invalid request to modify nothing.`,
		});
	}

	const [iidx, sdvx] = await Promise.all([
		GetArcAuth(user.id, "api/arc-iidx"),
		GetArcAuth(user.id, "api/arc-sdvx"),
	]);

	const existingData = { iidx, sdvx };

	for (const key of ["iidx", "sdvx"] as const) {
		const importType = `api/arc-${key}` as const;

		const value = body[key];

		if (value === null) {
			logger.info(`User ${FormatUserDoc(user)} removed ARC integration for ${importType}.`);

			await db["arc-saved-profiles"].remove(
				{
					userID: user.id,
					forImportType: importType,
				},
				{
					single: true,
				}
			);
		} else if (IsNonEmptyString(value)) {
			if (existingData[key]) {
				logger.info(`User updated ARC integration for ${importType}.`);
				await db["arc-saved-profiles"].update(
					{
						userID: user.id,
						forImportType: importType,
					},
					{
						$set: {
							accountID: value,
						},
					}
				);
			} else {
				logger.info(`User created ARC integration for ${importType}.`);
				await db["arc-saved-profiles"].insert({
					userID: user.id,
					forImportType: importType,
					accountID: value,
				});
			}
		}
	}

	const [iidx2, sdvx2] = await Promise.all([
		GetArcAuth(user.id, "api/arc-iidx"),
		GetArcAuth(user.id, "api/arc-sdvx"),
	]);

	return res.status(200).json({
		success: true,
		description: `Updated ARC integrations.`,
		body: {
			iidx: iidx2,
			sdvx: sdvx2,
		},
	});
});

export default router;
