import { SYMBOL_TACHI_API_AUTH, SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import { IsNullish } from "utils/misc";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import { ResolveUser } from "utils/user";
import type { RequestHandler } from "express";
import type { integer } from "tachi-common";

export const GetUserFromParam: RequestHandler = async (req, res, next) => {
	if (!req.params.userID) {
		return res.status(400).json({
			success: false,
			description: "No userID given.",
		});
	}

	let userID = req.params.userID;

	if (req.params.userID === "me") {
		const authUserID = req[SYMBOL_TACHI_API_AUTH].userID;

		if (authUserID === null) {
			return res.status(401).json({
				success: false,
				description: "Cannot use 'me' userID with no authentication.",
			});
		}

		// fast assign using JWT
		if (req.session.tachi?.user) {
			AssignToReqTachiData(req, { requestedUser: req.session.tachi.user });
			next();
			return;
		}

		userID = authUserID.toString();
	}

	const user = await ResolveUser(userID);

	if (!user) {
		return res.status(404).json({
			success: false,
			description: `The user ${userID} does not exist.`,
		});
	}

	AssignToReqTachiData(req, { requestedUser: user });

	next();
};

/**
 * Require the user making this request to also be the user in the :userID param.
 */
export const RequireAuthedAsUser: RequestHandler = (req, res, next) => {
	const user = GetTachiData(req, "requestedUser");

	if (req[SYMBOL_TACHI_API_AUTH].userID === null) {
		return res.status(401).json({
			success: false,
			description: `Authentication is required for this endpoint.`,
		});
	}

	if (req[SYMBOL_TACHI_API_AUTH].userID !== user.id) {
		return res.status(403).json({
			success: false,
			description: "You are not authorised as this user.",
		});
	}

	next();
};

/**
 * Require that this request is made with a Cookie, instead of any
 * API key. This is for things that services should not be allowed to
 * alter/access, like integration information.
 */
export const RequireSelfRequestFromUser: RequestHandler = (req, res, next) => {
	const user = GetTachiData(req, "requestedUser");

	if (req[SYMBOL_TACHI_API_AUTH].userID === null) {
		return res.status(401).json({
			success: false,
			description: `This endpoint requires session-level authentication.`,
		});
	}

	if (IsNullish(req.session.tachi?.user.id) || req[SYMBOL_TACHI_API_AUTH].userID !== user.id) {
		return res.status(403).json({
			success: false,
			description: `This request cannot be performed by an API key, and requires authentication.`,
		});
	}

	next();
};
