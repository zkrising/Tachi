import db from "external/mongo/db";
import { Environment } from "lib/setup/config";
import { AssignToReqTachiData, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";
import type { TachiAPIClientDocument } from "tachi-common";

export const GetClientFromID: RequestHandler = async (req, res, next) => {
	const client = await db["api-clients"].findOne(
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

	AssignToReqTachiData(req, { apiClientDoc: client });

	next();
};

export const RequireOwnershipOfClient: RequestHandler = (req, res, next) => {
	let client: Omit<TachiAPIClientDocument, "clientSecret">;

	// @hack
	// Sadly, expMiddlewareMock doesn't support mounting symbol props on
	// request. To hack around this for testing, we perform this hack.
	// There's an open issue for this here: https://github.com/i-like-robots/express-request-mock/issues/19
	/* istanbul ignore next */
	if (
		Environment.nodeEnv === "test" &&
		(req.safeBody.__terribleHackOauth2ClientDoc as TachiAPIClientDocument | undefined)
	) {
		// obviously a glaring hack and security flaw - this only applies
		// in testing.
		client = req.safeBody.__terribleHackOauth2ClientDoc as TachiAPIClientDocument;
	} else {
		client = GetTachiData(req, "apiClientDoc");
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

	next();
};
