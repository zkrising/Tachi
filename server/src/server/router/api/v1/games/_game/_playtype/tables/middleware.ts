import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";

export const GetTableFromParam: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game;
	const playtype = req[SYMBOL_TachiData]!.playtype;

	const table = await db.tables.findOne({ tableID: req.params.tableID, game, playtype });

	if (!table) {
		return res.status(404).json({
			success: false,
			description: `This table does not exist.`,
		});
	}

	AssignToReqTachiData(req, { tableDoc: table });

	return next();
};
