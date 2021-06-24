import { RequestHandler } from "express";
import { CONF_INFO } from "../../../../../../lib/setup/config";
import { IsValidGame } from "../../../../../../utils/misc";
import { AssignToReqTachiData } from "../../../../../../utils/req-tachi-data";

export const ValidateGameFromParam: RequestHandler = (req, res, next) => {
	if (!IsValidGame(req.params.game)) {
		return res.status(400).json({
			success: false,
			description: `Invalid/unsupported game ${
				req.params.game
			} - Expected any of ${CONF_INFO.supportedGames.join(", ")}`,
		});
	}

	AssignToReqTachiData(req, { game: req.params.game });

	return next();
};
