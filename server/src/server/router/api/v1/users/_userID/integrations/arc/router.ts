/* eslint-disable no-await-in-loop */
import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import { GetArcAuth } from "utils/queries/auth";
import { FormatUserDoc } from "utils/user";
import { RequireSelfRequestFromUser } from "../../middleware";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.use(RequireKamaitachi);
router.use(RequireSelfRequestFromUser);

/**
 * Return this users integration status for ARC.
 * @name GET /api/v1/users/:userID/integrations/arc
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const [iidx, ddr, sdvx] = await Promise.all([
		GetArcAuth(user.id, "api/arc-iidx"),
		GetArcAuth(user.id, "api/arc-ddr"),
		GetArcAuth(user.id, "api/arc-sdvx"),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved integration information for ARC.`,
		body: {
			iidx,
			ddr,
			sdvx,
		},
	});
});

/**
 * Modify this users integrations for ARC.
 * @name PATCH /api/v1/users/:userID/integrations/arc
 */
router.patch(
	"/",
	prValidate({ iidx: "*?string", ddr: "*?string", sdvx: "*?string" }),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;

		if (Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				description: `Invalid request to modify nothing.`,
			});
		}

		const [iidx, ddr, sdvx] = await Promise.all([
			GetArcAuth(user.id, "api/arc-iidx"),
			GetArcAuth(user.id, "api/arc-ddr"),
			GetArcAuth(user.id, "api/arc-sdvx"),
		]);

		const existingData = { iidx, ddr, sdvx };

		for (const key of ["iidx", "ddr", "sdvx"] as const) {
			const importType = `api/arc-${key}` as const;

			if (req.body[key] === null) {
				logger.info(
					`User ${FormatUserDoc(user)} removed ARC integration for ${importType}.`
				);

				await db["arc-saved-profiles"].remove(
					{
						userID: user.id,
						forImportType: importType,
					},
					{
						single: true,
					}
				);
			} else if (req.body[key]) {
				if (existingData[key]) {
					logger.info(`User updated ARC integration for ${importType}.`);
					await db["arc-saved-profiles"].update(
						{
							userID: user.id,
							forImportType: importType,
						},
						{
							$set: {
								accountID: req.body[key],
							},
						}
					);
				} else {
					logger.info(`User changed ARC integration for ${importType}.`);
					await db["arc-saved-profiles"].insert({
						userID: user.id,
						forImportType: importType,
						accountID: req.body[key],
					});
				}
			}
		}

		const [iidx2, ddr2, sdvx2] = await Promise.all([
			GetArcAuth(user.id, "api/arc-iidx"),
			GetArcAuth(user.id, "api/arc-ddr"),
			GetArcAuth(user.id, "api/arc-sdvx"),
		]);

		return res.status(200).json({
			success: true,
			description: `Updated ARC integrations.`,
			body: {
				iidx: iidx2,
				ddr: ddr2,
				sdvx: sdvx2,
			},
		});
	}
);

export default router;
