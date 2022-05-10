import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import { ALL_PERMISSIONS, UserAuthLevels } from "tachi-common";
import { SplitAuthorizationHeader } from "utils/misc";
import type { RequestHandler } from "express";
import type { APIPermissions, APITokenDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

const GuestToken: APITokenDocument = {
	token: null,
	userID: null,
	identifier: "Guest Token",
	permissions: {},
	fromAPIClient: null,
};

export const SetRequestPermissions: RequestHandler = CreateSetRequestPermissions("description");

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
 * This is set on req[SYMBOL_TachiAPIAuth].
 */
function CreateSetRequestPermissions(errorKeyName: string): RequestHandler {
	return async (req, res, next) => {
		if (req.session.tachi?.user.id) {
			req[SYMBOL_TACHI_API_AUTH] = {
				userID: req.session.tachi.user.id,
				identifier: `Session-Key ${req.session.tachi.user.id}`,
				token: null,
				permissions: ALL_PERMISSIONS,
				fromAPIClient: null,
			};
			next();
			return;
		}

		const header = req.header("Authorization");

		// if no auth was attempted, default to the guest token.
		if (!header) {
			req[SYMBOL_TACHI_API_AUTH] = GuestToken;
			next();
			return;
		}

		const { token, type } = SplitAuthorizationHeader(header);

		if (type !== "Bearer") {
			return res.status(400).json({
				success: false,
				[errorKeyName]: "Invalid Authorization Type - Expected Bearer.",
			});
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				[errorKeyName]: "Invalid token.",
			});
		}

		const apiTokenData = await db["api-tokens"].findOne({
			token,
		});

		if (!apiTokenData) {
			return res.status(401).json({
				success: false,
				[errorKeyName]:
					"The provided API token does not correspond with any key in the database.",
			});
		}

		req[SYMBOL_TACHI_API_AUTH] = {
			userID: apiTokenData.userID,
			token,
			permissions: apiTokenData.permissions,
			identifier: apiTokenData.identifier,
			fromAPIClient: apiTokenData.fromAPIClient,
		};

		next();
	};
}

/**
 * An identical implementation of SetRequestPermissions, but returns
 * fervidex-style errors (error, instead of description).
 *
 * @see SetRequestPermissions
 */
export const SetFervidexStyleRequestPermissions: RequestHandler =
	CreateSetRequestPermissions("error");

/**
 * Returns a middleware that enforces the request has the necessary permissions.
 * @param perms - Rest Parameter. The set of permissions necessary to use this endpoint.
 * @returns A middleware function.
 */
export const RequirePermissions =
	(...perms: Array<APIPermissions>): RequestHandler =>
	(req, res, next) => {
		if (!req[SYMBOL_TACHI_API_AUTH]) {
			logger.error(
				`RequirePermissions middleware was hit without any TachiAPIAuthentication?`
			);

			return res.status(500).json({
				success: false,
				description: "An internal error has occured.",
			});
		}

		if (!req[SYMBOL_TACHI_API_AUTH].userID) {
			return res.status(401).json({
				success: false,
				description: `You are not authorised to perform this action.`,
			});
		}

		const missingPerms = [];

		for (const perm of perms) {
			if (!req[SYMBOL_TACHI_API_AUTH]!.permissions[perm]) {
				missingPerms.push(perm);
			}
		}

		if (missingPerms.length > 0) {
			logger.info(
				`IP ${req.ip} - userID ${
					req[SYMBOL_TACHI_API_AUTH].userID
				} had insufficient permissions for request ${req.method} ${
					req.url
				}. ${missingPerms.join(", ")}`
			);
			return res.status(403).json({
				success: false,
				description: `You are missing the following permissions necessary for this request: ${missingPerms.join(
					", "
				)}`,
			});
		}

		next();
	};

const CreateRequireNotGuest =
	(errorKeyName: string): RequestHandler =>
	(req, res, next) => {
		if (!req[SYMBOL_TACHI_API_AUTH]) {
			logger.error(`RequirePermissions middleware was hit without any TachiAPIData?`);
			return res.status(500).json({
				success: false,
				description: "An internal error has occured.",
			});
		}

		if (req[SYMBOL_TACHI_API_AUTH].userID === null) {
			logger.info(`Request to ${req.method} ${req.url} was attempted by guest.`);
			return res.status(401).json({
				success: false,
				[errorKeyName]: "This endpoint requires authentication.",
			});
		}

		next();
	};

export const RequireNotGuest: RequestHandler = CreateRequireNotGuest("description");

export const FervidexStyleRequireNotGuest: RequestHandler = CreateRequireNotGuest("error");

export const RejectIfBanned: RequestHandler = async (req, res, next) => {
	if (req[SYMBOL_TACHI_API_AUTH].userID) {
		const isBanned = await db.users.findOne({
			id: req[SYMBOL_TACHI_API_AUTH].userID!,
			authLevel: UserAuthLevels.BANNED,
		});

		if (isBanned) {
			return res.status(403).json({
				success: false,
				description: `You are banned from ${TachiConfig.NAME}`,
			});
		}
	}

	next();
};
