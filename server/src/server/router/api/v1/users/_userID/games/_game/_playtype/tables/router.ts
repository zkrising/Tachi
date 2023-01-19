import { GetTableFromParam } from "../../../../../../games/_game/_playtype/tables/middleware";
import { Router } from "express";
import { GetEnumDistForFolders, GetFoldersFromTable } from "utils/folder";
import { GetTachiData, GetUGPT } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves a users statistics on this table.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/tables/:tableID
 */
router.get("/:tableID", GetTableFromParam, async (req, res) => {
	const { user } = GetUGPT(req);

	const table = GetTachiData(req, "tableDoc");

	const folders = await GetFoldersFromTable(table);

	// @optimisable - Requests a lot of charts we don't care about
	// could be cached too, i guess.
	const stats = await GetEnumDistForFolders(user.id, folders);

	return res.status(200).json({
		success: true,
		description: `Returned stats for ${folders.length} folders.`,
		body: {
			folders,
			stats,
			table,
		},
	});
});

export default router;
