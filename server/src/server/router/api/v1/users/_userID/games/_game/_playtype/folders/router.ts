import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchCollection } from "lib/search/search";
import { FolderDocument } from "tachi-common";
import { GetGradeDistributionForFolders } from "utils/folder";
import { IsString } from "utils/misc";
import folderIDRouter from "./_folderID/router";

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
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search.`,
		});
	}

	const folders = await SearchCollection(
		db.folders,
		req.query.search,
		{ game, playtype, inactive: !!req.query.inactive },
		20
	);

	const stats = await GetGradeDistributionForFolders(user.id, folders);

	return res.status(200).json({
		success: true,
		description: `Returned ${stats.length} folders.`,
		body: {
			folders,
			stats,
		},
	});
});

router.use("/:folderID", folderIDRouter);

export default router;
