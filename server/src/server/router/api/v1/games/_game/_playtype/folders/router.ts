import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchCollection } from "lib/search/search";
import { GetFolderCharts } from "utils/folder";
import { IsString } from "utils/misc";
import { GetDefaultTierlist } from "utils/tierlist";
import { GetFolderFromParam, HandleTierlistIDParam } from "./middleware";

const router: Router = Router({ mergeParams: true });

/**
 * Search the folders for this game.
 *
 * @param search - The query to search for.
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

	const folders = await SearchCollection(db.folders, req.query.search, { game, playtype }, 100);

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

/**
 * Return all of the tierlist information for the charts inside this folder.
 *
 * @param tierlistID - Optionally, specify and alternative tierlistID to use.
 * If not present, uses the game's default. If the game does not have a
 * default, 501 is returned.
 * @param type - The type of tierlist data to return. Can be "lamp" or
 * "score".
 */
router.get("/:folderID/tierlist", GetFolderFromParam, HandleTierlistIDParam, async (req, res) => {
	const folder = req[SYMBOL_TachiData]!.folderDoc!;
	const tierlist = req[SYMBOL_TachiData]!.tierlistDoc!;

	if (req.query.type !== "lamp" && req.query.type !== "score") {
		return res.status(400).json({
			success: false,
			description: `Invalid value of type. Expected lamp or score.`,
		});
	}

	const { charts, songs } = await GetFolderCharts(folder, {}, true);

	const tierlistData = await db["tierlist-data"].find({
		chartID: { $in: charts.map((e) => e.chartID) },
		tierlistID: tierlist!.tierlistID,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${tierlistData.length} tierlist data documents.`,
		body: {
			charts,
			songs,
			tierlistData,
			tierlist,
			folder,
		},
	});
});

export default router;
