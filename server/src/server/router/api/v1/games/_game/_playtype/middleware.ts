import { GetGameConfig } from "tachi-common";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";
import type { Playtype, Game } from "tachi-common";

export const ValidatePlaytypeFromParam: RequestHandler = (req, res, next) => {
	const game = GetTachiData(req, "game");

	const gameConfig = GetGameConfig(game);

	if (!gameConfig.playtypes.includes(req.params.playtype as Playtype)) {
		return res.status(400).json({
			success: false,
			description: `The playtype ${req.params.playtype} is not supported.`,
		});
	}

	AssignToReqTachiData(req, { playtype: req.params.playtype as Playtype });

	next();
};

export const ValidatePlaytypeFromParamFor =
	(game: Game): RequestHandler =>
	(req, res, next) => {
		const gameConfig = GetGameConfig(game);

		if (!gameConfig.playtypes.includes(req.params.playtype as Playtype)) {
			return res.status(400).json({
				success: false,
				description: `The playtype ${req.params.playtype} is not supported.`,
			});
		}

		AssignToReqTachiData(req, { playtype: req.params.playtype as Playtype });

		next();
	};
