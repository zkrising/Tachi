import folderIDRouter from "./_folderID/router";
import { Router } from "express";
import db from "external/mongo/db";
import { SearchCollection } from "lib/search/search";
import { GetGradeLampDistributionForFolders, GetRecentlyViewedFolders } from "utils/folder";
import { IsString } from "utils/misc";
import { GetUGPT } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Search folders, and supplant a users grade+lamp distribution on that
 * folder as part of the returns.
 *
 * This is a "beefed-up" version of GPT /folders, but with this users
 * stats returned at the same time.
 *
 * @param search - What to search for.
 * @param inactive - Also show inactive folders, such as those on old versions.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders
 */
router.get("/", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search.`,
		});
	}

	const folders = await SearchCollection(
		db.folders,
		req.query.search,
		{ game, playtype, inactive: Boolean(req.query.inactive) },
		20
	);

	const stats = await GetGradeLampDistributionForFolders(user.id, folders);

	return res.status(200).json({
		success: true,
		description: `Returned ${stats.length} folders.`,
		body: {
			folders,
			stats,
		},
	});
});

/**
 * Get a users most recently interacted with folders.
 *
 * A folder is interacted with if it is directly fetched using a session key.
 * This - in UI terms - is when the user clicks on that folder.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/recent
 */
router.get("/recent", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const { views, folders } = await GetRecentlyViewedFolders(user.id, game, playtype);

	const stats = await GetGradeLampDistributionForFolders(user.id, folders);

	return res.status(200).json({
		success: true,
		description: `Returned ${views.length} recently interacted with folders.`,
		body: {
			views,
			folders,
			stats,
		},
	});
});

router.use("/:folderID", folderIDRouter);

export default router;
