import { RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { OAuth2ApplicationDocument } from "tachi-common";
import { AssignToReqTachiData } from "utils/req-tachi-data";

export const GetClientFromID: RequestHandler = async (req, res, next) => {
	const client = await db["oauth2-clients"].findOne(
		{
			clientID: req.params.clientID,
		},
		{
			projection: {
				clientSecret: 0,
			},
		}
	);

	if (!client) {
		return res.status(404).json({
			success: false,
			description: `This client does not exist.`,
		});
	}

	AssignToReqTachiData(req, { oauth2ClientDoc: client });

	return next();
};

export const RequireOwnershipOfClient: RequestHandler = (req, res, next) => {
	let client: Omit<OAuth2ApplicationDocument, "clientSecret">;

	// @hack
	// Sadly, expMiddlewareMock doesn't support mounting symbol props on
	// request. To hack around this for testing, we perform this hack.
	// There's an open issue for this here: https://github.com/i-like-robots/express-request-mock/issues/19
	/* istanbul ignore next */
	if (process.env.NODE_ENV === "test" && req.body.__terribleHackOauth2ClientDoc) {
		// obviously a glaring hack and security flaw - this only applies
		// in testing.
		client = req.body.__terribleHackOauth2ClientDoc;
	} else {
		client = req[SYMBOL_TachiData]!.oauth2ClientDoc!;
	}

	const user = req.session.tachi?.user;

	if (!user) {
		return res.status(401).json({
			success: false,
			description: `You are not authenticated (for a session-level request, atleast).`,
		});
	}

	if (user.id !== client.author) {
		return res.status(403).json({
			success: false,
			description: `You are not authorized to perform this action.`,
		});
	}
	return next();
};
