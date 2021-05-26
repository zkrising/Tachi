import { GenericAuthDocument } from "kamaitachi-common";
import { RequestHandler } from "express";
import db from "../../../../external/mongo/db";
import { SYMBOL_KtchiData } from "../../../../lib/constants/ktchi";
import { SplitAuthorizationHeader } from "../../../../utils/misc";
import { AssignToReqKtchiData } from "../../../../utils/req-ktchi-data";

const ValidateAuthToken: RequestHandler = async (req, res, next) => {
    const header = req.header("Authorization");

    if (!header) {
        return res.status(400).json({
            success: false,
            description: `No Authorization provided.`,
        });
    }

    const { type, token } = SplitAuthorizationHeader(header);

    if (type !== "Bearer") {
        return res.status(400).json({
            success: false,
            description: `Invalid Authorization Type.`,
        });
    }

    const beatorajaAuthDoc = (await db["beatoraja-auth-tokens"].find({
        token,
    })) as GenericAuthDocument | null;

    if (!beatorajaAuthDoc) {
        return res.status(401).json({
            success: false,
            description: "Unauthorised.",
        });
    }

    AssignToReqKtchiData(req, { beatorajaAuthDoc });

    return next();
};
