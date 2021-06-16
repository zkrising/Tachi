import { RequestHandler } from "express";
import { AssignToReqTachiData } from "../../../../../../utils/req-tachi-data";
import { ResolveUser } from "../../../../../../utils/user";

export const GetUserFromParam: RequestHandler = async (req, res, next) => {
    if (!req.params.userID) {
        return res.status(400).json({
            success: false,
            description: "No userID given.",
        });
    }

    const user = await ResolveUser(req.params.userID);

    if (!user) {
        return res.status(404).json({
            success: false,
            description: `The user ${req.params.userID} does not exist.`,
        });
    }

    AssignToReqTachiData(req, { requestedUser: user });

    return next();
};
