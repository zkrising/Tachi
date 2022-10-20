import { RequireAuthedAsUser } from "../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { CDNDelete, CDNRedirect, CDNStoreOrOverwrite } from "lib/cdn/cdn";
import { GetProfilePictureURL } from "lib/cdn/url-format";
import { ONE_MEGABYTE } from "lib/constants/filesize";
import CreateLogCtx from "lib/logger/logger";
import { RequirePermissions } from "server/middleware/auth";
import { CreateMulterSingleUploadMiddleware } from "server/middleware/multer-upload";
import { HashSHA256 } from "utils/crypto";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Sets a profile picture.
 *
 * @param pfp - A JPG, PNG or GIF file less than 1mb.
 * @note although GIFs are supported, this functionality isn't documented on the site.
 * this is kind of an easter egg.
 *
 * @name PUT /api/v1/users/:userID/pfp
 */
router.put(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	CreateMulterSingleUploadMiddleware("pfp", ONE_MEGABYTE, logger),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");

		if (!user.customPfpLocation) {
			logger.verbose(`User ${FormatUserDoc(user)} set a custom profile picture.`);
		} else {
			logger.verbose(`User ${FormatUserDoc(user)} updated their profile picture.`);
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
			await CDNStoreOrOverwrite(GetProfilePictureURL(user.id, contentHash), req.file.buffer);
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid file - only JPG and PNG files are supported.`,
			});
		}

		if (req.session.tachi?.user) {
			req.session.tachi.user.customPfpLocation = contentHash;
		}

		await db.users.update({ id: user.id }, { $set: { customPfpLocation: contentHash } });

		return res.status(200).json({
			success: true,
			description: `Stored profile picture.`,
			body: {
				get: req.originalUrl,
			},
		});
	}
);

/**
 * Returns this user's profile picture. If the user does not have a custom profile picture,
 * return the default profile picture.
 *
 * @name GET /api/v1/users/:userID/pfp
 */
router.get("/", (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	logger.debug("User Info for /:userID/pfp request is ", user);

	if (!user.customPfpLocation) {
		res.setHeader("Content-Type", "image/png");
		CDNRedirect(res, "/users/default/pfp");
		return;
	}

	CDNRedirect(res, GetProfilePictureURL(user.id, user.customPfpLocation));
});

/**
 * Deletes this user's profile picture, and go back to the default profile picture.
 *
 * @name DELETE /api/v1/users/:userID/pfp
 */
router.delete(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");

		if (!user.customPfpLocation) {
			return res.status(404).json({
				success: false,
				description: `You do not have a custom profile picture to delete.`,
			});
		}

		await CDNDelete(GetProfilePictureURL(user.id, user.customPfpLocation));

		await db.users.update({ id: user.id }, { $set: { customPfpLocation: null } });

		return res.status(200).json({
			success: true,
			description: `Removed custom profile picture.`,
			body: {},
		});
	}
);

export default router;
