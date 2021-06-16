import { RequestHandler } from "express";
import db from "../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import { IsValidGame, IsValidPlaytype } from "../../../../../../../../../utils/misc";
import { AssignToReqTachiData } from "../../../../../../../../../utils/req-tachi-data";

export const CheckUserPlayedGamePlaytype: RequestHandler = async (req, res, next) => {
    const user = req[SYMBOL_TachiData]!.requestedUser!;

    if (!IsValidGame(req.params.game)) {
        return res.status(400).json({
            success: false,
            description: `The game ${req.params.game} is not supported.`,
        });
    }

    if (!IsValidPlaytype(req.params.game, req.params.playtype)) {
        return res.status(400).json({
            success: false,
            description: `The game ${req.params.game} does not have a playtype called ${req.params.playtype}.`,
        });
    }

    const stats = await db["game-stats"].findOne({
        userID: user.id,
        game: req.params.game,
        playtype: req.params.playtype,
    });

    if (!stats) {
        return res.status(404).json({
            success: false,
            description: `The user ${user.username} has not played ${req.params.game} (${req.params.playtype})`,
        });
    }

    AssignToReqTachiData(req, { requestedUserGameStats: stats });

    return next();
};
