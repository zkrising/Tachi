import { RequestHandler } from "express";
import db from "../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../lib/constants/tachi";
import { IsString } from "../../../../../../../../utils/misc";
import { AssignToReqTachiData } from "../../../../../../../../utils/req-tachi-data";
import { GetDefaultTierlist } from "../../../../../../../../utils/tierlist";

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

export const HandleTierlistIDParam: RequestHandler = async (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	let tierlist;

	if (IsString(req.query.tierlistID)) {
		tierlist = await db.tierlists.findOne({
			tierlistID: req.query.tierlistID,
			game,
			playtype,
		});

		if (!tierlist) {
			return res.status(404).json({
				success: false,
				description: `A tierlist with this ID (for this game + playtype) does not exist.`,
			});
		}
	} else {
		tierlist = await GetDefaultTierlist(game, playtype);

		if (!tierlist) {
			return res.status(501).json({
				success: false,
				description: `This game does not support tierlists, yet.`,
			});
		}
	}

	AssignToReqTachiData(req, { tierlistDoc: tierlist });

	return next();
};
