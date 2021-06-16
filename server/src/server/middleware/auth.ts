import { RequestHandler } from "express";
import db from "../../external/mongo/db";
import { SYMBOL_TachiAPIAuth } from "../../lib/constants/tachi";
import { SplitAuthorizationHeader } from "../../utils/misc";
import { APITokenDocument, APIPermissions } from "tachi-common";
import CreateLogCtx from "../../lib/logger/logger";

const logger = CreateLogCtx(__filename);

const GuestToken: APITokenDocument = {
    token: null,
    userID: null,
    identifier: "Guest Token",
    permissions: {},
};

export const AllPermissions: Record<APIPermissions, true> = {
    "create:goal": true,
    "manage:goal": true,
    "submit:score": true,
};

/**
 * Sets the permissions for this request, alongside the user that is making the request.
 *
 * If this request was made with a valid Session Token, then a "self-key" is
 * set as the request token.
 *
 * If this request was made with a valid Authorization: Bearer <token>, then the
 * corresponding key is set as the request token.
 *
 * If this request was made with no auth headers or session tokens, then a guest
 * token is set as the request token, with no permissions.
 *
 * This is set on req[SYMBOL_TachiAPIData].
 */
export const SetRequestPermissions: RequestHandler = async (req, res, next) => {
    if (req.session?.tachi?.userID) {
        req[SYMBOL_TachiAPIAuth] = {
            userID: req.session.tachi.userID,
            identifier: `Session-Key ${req.session.tachi.userID}`,
            token: null,
            permissions: AllPermissions,
        };
        return next();
    }

    const header = req.header("Authorization");

    // if no auth was attempted, default to the guest token.
    if (!header) {
        req[SYMBOL_TachiAPIAuth] = GuestToken;
        return next();
    }

    const { token, type } = SplitAuthorizationHeader(header);

    if (type !== "Bearer") {
        return res.status(400).json({
            success: false,
            description: "Invalid Authorization Type - Expected Bearer.",
        });
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            description: "Invalid token.",
        });
    }

    const apiTokenData = await db["api-tokens"].findOne({
        token,
    });

    if (!apiTokenData) {
        return res.status(401).json({
            success: false,
            description: "The provided API token does not correspond with any key in the database.",
        });
    }

    req[SYMBOL_TachiAPIAuth] = {
        userID: apiTokenData.userID,
        token,
        permissions: apiTokenData.permissions,
        identifier: apiTokenData.identifier,
    };

    return next();
};

/**
 * Returns a middleware that enforces the request has the necessary permissions.
 * @param perms - Rest Parameter. The set of permissions necessary to use this endpoint.
 * @returns A middleware function.
 */
export const RequirePermissions =
    (...perms: APIPermissions[]): RequestHandler =>
    (req, res, next) => {
        if (!req[SYMBOL_TachiAPIAuth]) {
            logger.error(`RequirePermissions middleware was hit without any TachiAPIData?`);

            return res.status(500).json({
                success: false,
                description: "An internal error has occured.",
            });
        }

        const missingPerms = [];
        for (const perm of perms) {
            if (!req[SYMBOL_TachiAPIAuth]!.permissions[perm]) {
                missingPerms.push(perm);
            }
        }

        if (missingPerms.length > 0) {
            logger.info(
                `IP ${req.ip} - userID ${
                    req[SYMBOL_TachiAPIAuth].userID
                } had insufficient permissions for request ${req.method} ${
                    req.url
                }. ${missingPerms.join(", ")}`
            );
            return res.status(401).json({
                success: false,
                description: `You are missing the following permissions necessary for this request: ${missingPerms.join(
                    ", "
                )}`,
            });
        }

        return next();
    };

export const RequireNotGuest: RequestHandler = (req, res, next) => {
    if (!req[SYMBOL_TachiAPIAuth]) {
        logger.error(`RequirePermissions middleware was hit without any TachiAPIData?`);
        return res.status(500).json({
            success: false,
            description: "An internal error has occured.",
        });
    }

    if (!req[SYMBOL_TachiAPIAuth].userID) {
        logger.info(`Request to ${req.method} ${req.url} was attempted by guest.`);
        return res.status(401).json({
            success: false,
            description: "This endpoint requires authentication.",
        });
    }

    return next();
};
