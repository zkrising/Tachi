import { Router } from "express";
import db from "../../../../../../../external/mongo/db";
import { CDNStoreOrOverwrite, CDNRedirect, CDNDelete } from "../../../../../../../lib/cdn/cdn";
import { GetProfileBannerURL } from "../../../../../../../lib/cdn/url-format";
import { ONE_MEGABYTE } from "../../../../../../../lib/constants/filesize";
import { SYMBOL_TachiData } from "../../../../../../../lib/constants/tachi";
import CreateLogCtx from "../../../../../../../lib/logger/logger";
import { FormatUserDoc } from "../../../../../../../utils/user";
import { RequirePermissions } from "../../../../../../middleware/auth";
import { CreateMulterSingleUploadMiddleware } from "../../../../../../middleware/multer-upload";
import { RequireAuthedAsUser } from "../middleware";

// note: this is just the ../pfp/router.ts code copied and altered.

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Sets a profile banner.
 *
 * @param banner - A JPG or PNG file less than 1mb.
 *
 * @name PUT /api/v1/users/:userID/banner
 */
router.put(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	CreateMulterSingleUploadMiddleware("banner", ONE_MEGABYTE, logger),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;

		let updateBanner = false;

		if (!user.customBanner) {
			logger.verbose(`User ${FormatUserDoc(user)} set a custom profile banner.`);
			updateBanner = true;
		} else {
			logger.verbose(`User ${FormatUserDoc(user)} updated their profile banner.`);
		}

		if (!req.file) {
			logger.error(
				`Conflicting state - no req.file has been populated but passed middleware? (${FormatUserDoc(
					user
				)})`
			);
			return res.status(500).json({
				success: false,
				description: `An internal error has occured.`,
			});
		}

		if (req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/png") {
			await CDNStoreOrOverwrite(GetProfileBannerURL(user.id), req.file.buffer);
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid file - only JPG and PNG files are supported.`,
			});
		}

		if (updateBanner) {
			await db.users.update({ id: user.id }, { $set: { customBanner: true } });
		}

		return res.status(200).json({
			success: true,
			description: `Stored profile banner.`,
			body: {
				get: req.originalUrl,
			},
		});
	}
);

/**
 * Returns this user's profile banner. If the user does not have a custom profile banner,
 * return the default profile banner.
 *
 * @name GET /api/v1/users/:userID/banner
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	if (!user.customBanner) {
		res.setHeader("Content-Type", "image/png");
		return CDNRedirect(res, "/users/default/banner.png");
	}

	// express sniffs whether this is a png or jpg **and** browsers dont care either.
	return CDNRedirect(res, GetProfileBannerURL(user.id));
});

/**
 * Deletes this user's profile banner, and go back to the default profile banner.
 *
 * @name DELETE /api/v1/users/:userID/banner
 */
router.delete(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;

		if (!user.customBanner) {
			return res.status(404).json({
				success: false,
				description: `You do not have a custom profile banner to delete.`,
			});
		}

		await CDNDelete(GetProfileBannerURL(user.id));
		await db.users.update({ id: user.id }, { $set: { customBanner: false } });

		return res.status(200).json({
			success: true,
			description: `Removed custom profile banner.`,
			body: {},
		});
	}
);

export default router;
