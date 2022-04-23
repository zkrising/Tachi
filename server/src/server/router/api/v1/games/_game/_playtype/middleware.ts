import { Game, GetGameConfig, Playtype, Playtypes } from "tachi-common";
import { RequestHandler } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";

export const ValidatePlaytypeFromParam: RequestHandler = (req, res, next) => {
	const game = req[SYMBOL_TachiData]!.game!;

	const gameConfig = GetGameConfig(game);

	if (!gameConfig.validPlaytypes.includes(req.params.playtype as Playtype)) {
		return res.status(400).json({
			success: false,
			description: `The playtype ${req.params.playtype} is not supported.`,
		});
	}

	AssignToReqTachiData(req, { playtype: req.params.playtype as Playtype });

	return next();
};
