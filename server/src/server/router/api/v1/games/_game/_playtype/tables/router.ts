import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { GetTableFromParam } from "./middleware";
import { GetFoldersFromTable } from "utils/folder";

const router: Router = Router({ mergeParams: true });

/**
 * Return all the tables for this game.
 *
 * @name GET /api/v1/games/:game/:playtype/tables
 */
router.get("/", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const tables = await db.tables.find({ game, playtype });

	return res.status(200).json({
		success: true,
		description: `Returned ${tables.length} tables.`,
		body: tables,
	});
});

/**
 * Return the folder documents that make up this table.
 *
 * @name GET /api/v1/games/:game/:playtype/tables/:tableID
 */
router.get("/:tableID", GetTableFromParam, async (req, res) => {
	const table = req[SYMBOL_TachiData]!.tableDoc!;

	const folders = await GetFoldersFromTable(table);

	return res.status(200).json({
		success: true,
		description: `Returned ${folders.length} for table ${table.title}.`,
		body: {
			folders,
			table,
		},
	});
});

export default router;
