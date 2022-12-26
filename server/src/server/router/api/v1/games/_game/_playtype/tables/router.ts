import { GetTableFromParam } from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FormatGame } from "tachi-common";
import { GetFoldersFromTable } from "utils/folder";
import { GetGPT, GetTachiData } from "utils/req-tachi-data";
import type { FilterQuery } from "mongodb";
import type { TableDocument } from "tachi-common";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Return all the tables for this game.
 *
 * @param showInactive - If present, also show "inactive" tables.
 *
 * @name GET /api/v1/games/:game/:playtype/tables
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const query: FilterQuery<TableDocument> = { game, playtype };

	if (req.query.showInactive === undefined) {
		query.inactive = false;
	}

	const tables = await db.tables.find(query);

	if (tables.length === 0) {
		logger.error(
			`The game ${FormatGame(
				game,
				playtype
			)} has no tables. This renders table support for the game broken!`
		);
		return res.status(500).json({
			success: false,
			description: "This game has no tables.",
		});
	}

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
	const table = GetTachiData(req, "tableDoc");

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
