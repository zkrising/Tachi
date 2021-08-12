import { RequestHandler } from "express";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "lib/constants/tachi";
import { AssignToReqTachiData } from "utils/req-tachi-data";
import { ResolveUser } from "utils/user";

export const GetUserFromParam: RequestHandler = async (req, res, next) => {
	if (!req.params.userID) {
		return res.status(400).json({
			success: false,
			description: "No userID given.",
		});
	}

	let userID = req.params.userID;

	if (req.params.userID === "me") {
		if (!req[SYMBOL_TachiAPIAuth].userID) {
			return res.status(401).json({
				success: false,
				description: "Cannot use 'me' userID with no authentication.",
			});
		}

		userID = req[SYMBOL_TachiAPIAuth].userID!.toString();
	}

	const user = await ResolveUser(userID);

	if (!user) {
		return res.status(404).json({
			success: false,
			description: `The user ${userID} does not exist.`,
		});
	}

	AssignToReqTachiData(req, { requestedUser: user });

	return next();
};

/**
 * Require the user making this request to also be the user in the :userID param.
 */
export const RequireAuthedAsUser: RequestHandler = (req, res, next) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	if (req[SYMBOL_TachiAPIAuth].userID !== user.id) {
		return res.status(403).json({
			success: false,
			description: "You are not authorised as this user.",
		});
	}

	return next();
};

/**
 * Require that this request is made with a Cookie, instead of any
 * API key. This is for things that services should not be allowed to
 * alter/access, like integration information.
 */
export const RequireSelfRequestFromUser: RequestHandler = (req, res, next) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	if (req.session.tachi?.userID || req[SYMBOL_TachiAPIAuth].userID !== user.id) {
		return res.status(403).json({
			success: false,
			description: `This request cannot be performed by an API key, and requires authentication.`,
		});
	}

	return next();
};
