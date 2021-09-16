import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { IsString } from "utils/misc";
import { AssignToReqTachiData } from "utils/req-tachi-data";

export const GetFolderFromParam: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const folder = await db.folders.findOne({ folderID: req.params.folderID, game, playtype });

	if (!folder) {
		return res.status(404).json({
			success: false,
			description: `This folder does not exist.`,
		});
	}

	AssignToReqTachiData(req, { folderDoc: folder });

	return next();
};
