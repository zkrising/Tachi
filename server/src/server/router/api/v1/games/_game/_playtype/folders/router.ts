import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchCollection } from "lib/search/search";
import { GetFolderCharts } from "utils/folder";
import { IsString } from "utils/misc";
import { GetFolderFromParam } from "./middleware";

const router: Router = Router({ mergeParams: true });

/**
 * Search the folders for this game.
 *
 * @param search - The query to search for.
 * @param inactive - Also show inactive folders, such as those on old versions.
 *
 * @name GET /api/v1/games/:game/:playtype/folders
 */
router.get("/", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

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
		100
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${folders.length} folders.`,
		body: folders,
	});
});

/**
 * Get the folder at this ID, alongside its charts and songs.
 *
 * @name GET /api/v1/games/:game/:playtype/folders/:folderID
 */
router.get("/:folderID", GetFolderFromParam, async (req, res) => {
	const folder = req[SYMBOL_TachiData]!.folderDoc!;

	const { songs, charts } = await GetFolderCharts(folder, {}, true);

	return res.status(200).json({
		success: true,
		description: `Returned data for folder ${folder.title}`,
		body: {
			songs,
			charts,
			folder,
		},
	});
});

export default router;
