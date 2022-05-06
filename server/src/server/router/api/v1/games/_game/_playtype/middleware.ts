import { SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import { Game, GetGameConfig, Playtypes } from "tachi-common";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";
import type { Playtype } from "tachi-common";

export const ValidatePlaytypeFromParam: RequestHandler = (req, res, next) => {
	const game = req[SYMBOL_TACHI_DATA]!.game!;

	const gameConfig = GetGameConfig(game);

	if (!gameConfig.validPlaytypes.includes(req.params.playtype as Playtype)) {
		return res.status(400).json({
			success: false,
			description: `The playtype ${req.params.playtype} is not supported.`,
		});
	}

	AssignToReqTachiData(req, { playtype: req.params.playtype as Playtype });

	next();
};
