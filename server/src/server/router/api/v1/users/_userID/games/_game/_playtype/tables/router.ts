import { Router } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import {
	CalculateGradeDistribution,
	CalculateLampDistribution,
	GetFoldersFromTable,
	GetPBsOnFolder,
} from "utils/folder";
// @todo maybe refactor where middleware is stored to avoid paths this ugly.
import { GetTableFromParam } from "../../../../../../games/_game/_playtype/tables/middleware";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves a users statistics on this table.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/tables/:tableID
 */
router.get("/:tableID", GetTableFromParam, async (req, res) => {
	const table = req[SYMBOL_TachiData]!.tableDoc!;
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const folders = await GetFoldersFromTable(table);

	// @optimisable - Requests a lot of charts we don't care about
	// could be cached too, i guess.
	const stats = await Promise.all(
		folders.map((f) =>
			GetPBsOnFolder(user.id, f).then((r) => ({
				grades: CalculateGradeDistribution(r.pbs),
				lamps: CalculateLampDistribution(r.pbs),
			}))
		)
	);

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
