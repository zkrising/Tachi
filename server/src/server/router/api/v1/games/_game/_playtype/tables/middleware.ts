import db from "external/mongo/db";
import { SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

export const GetTableFromParam: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TACHI_DATA]!.game;
	const playtype = req[SYMBOL_TACHI_DATA]!.playtype;

	const table = await db.tables.findOne({ tableID: req.params.tableID, game, playtype });

	if (!table) {
		return res.status(404).json({
			success: false,
			description: `This table does not exist.`,
		});
	}

	AssignToReqTachiData(req, { tableDoc: table });

	next();
};
