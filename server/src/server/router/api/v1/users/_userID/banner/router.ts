import { RequireAuthedAsUser } from "../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { CDNDelete, CDNRedirect, CDNStoreOrOverwrite } from "lib/cdn/cdn";
import { GetProfileBannerURL } from "lib/cdn/url-format";
import { ONE_MEGABYTE } from "lib/constants/filesize";
import CreateLogCtx from "lib/logger/logger";
import { RequirePermissions } from "server/middleware/auth";
import { CreateMulterSingleUploadMiddleware } from "server/middleware/multer-upload";
import { HashSHA256 } from "utils/crypto";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";

// note: this is just the ../pfp/router.ts code copied and altered.

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Sets a profile banner.
 *
 * @param banner - A JPG, PNG or GIF file less than 1mb.
 * @note although GIFs are supported, this functionality isn't documented on the site.
 * this is kind of an easter egg.
 *
 * @name PUT /api/v1/users/:userID/banner
 */
router.put(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	CreateMulterSingleUploadMiddleware("banner", ONE_MEGABYTE, logger),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");

		if (!user.customBannerLocation) {
			logger.verbose(`User ${FormatUserDoc(user)} set a custom profile banner.`);
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

		const contentHash = HashSHA256(req.file.buffer);

		if (
			req.file.mimetype === "image/jpeg" ||
			req.file.mimetype === "image/png" ||
			req.file.mimetype === "image/gif"
		) {
			await CDNStoreOrOverwrite(GetProfileBannerURL(user.id, contentHash), req.file.buffer);
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid file - only JPG and PNG files are supported.`,
			});
		}

		if (req.session.tachi?.user) {
			req.session.tachi.user.customBannerLocation = contentHash;
		}

		await db.users.update({ id: user.id }, { $set: { customBannerLocation: contentHash } });

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
router.get("/", (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	if (!user.customBannerLocation) {
		res.setHeader("Content-Type", "image/png");
		CDNRedirect(res, "/users/default/banner");
		return;
	}

	// express sniffs whether this is a png or jpg **and** browsers dont care either.
	CDNRedirect(res, GetProfileBannerURL(user.id, user.customBannerLocation));
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
		const user = GetTachiData(req, "requestedUser");

		if (!user.customBannerLocation) {
			return res.status(404).json({
				success: false,
				description: `You do not have a custom profile banner to delete.`,
			});
		}

		await CDNDelete(GetProfileBannerURL(user.id, user.customBannerLocation));
		await db.users.update({ id: user.id }, { $set: { customBannerLocation: null } });

		return res.status(200).json({
			success: true,
			description: `Removed custom profile banner.`,
			body: {},
		});
	}
);

export default router;
