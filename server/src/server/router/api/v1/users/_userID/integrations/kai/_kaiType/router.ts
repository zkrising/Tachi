import { ValidateKaiType } from "./middleware";
import { RequireSelfRequestFromUser } from "../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import {
	GetKaiTypeClientCredentials,
	KaiTypeToBaseURL,
} from "lib/score-import/import-types/common/api-kai/utils";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { RequireKamaitachi } from "server/middleware/type-require";
import fetch from "utils/fetch";
import { NotNullish } from "utils/misc";
import { GetKaiAuth, RevokeKaiAuth } from "utils/queries/auth";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import { URL } from "url";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.use(RequireKamaitachi, RequireSelfRequestFromUser, ValidateKaiType);

/**
 * Return the authentication status for this kaiType.
 * @note - Express's types infer arg0 of "/" to mean no params, for some reason.
 * the <any> generic overrides this behaviour.
 *
 * @name GET /api/v1/users/:userID/integrations/kai/:kaiType
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get<any>("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");
	const kaiType = NotNullish(req.params.kaiType).toUpperCase() as "EAG" | "FLO" | "MIN";

	const authDoc = await GetKaiAuth(user.id, kaiType);

	return res.status(200).json({
		success: true,
		description: authDoc ? `User is authenticated.` : `User is unauthenticated.`,
		body: {
			authStatus: !!authDoc,
		},
	});
});

/**
 * Revoke your authentication for this kaiType.
 * @note - Express's types infer arg0 of "/" to mean no params, for some reason.
 * the <any> generic overrides this behaviour.
 *
 * @name DELETE /api/v1/users/:userID/integrations/kai/:kaiType
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.delete<any>("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");
	const kaiType = NotNullish(req.params.kaiType).toUpperCase() as "EAG" | "FLO" | "MIN";

	const authDoc = await GetKaiAuth(user.id, kaiType);

	if (!authDoc) {
		return res.status(409).json({
			success: false,
			description: `You are not authorised with this service.`,
		});
	}

	await RevokeKaiAuth(user.id, kaiType);

	return res.status(200).json({
		success: true,
		description: `Revoked authentication for ${kaiType}.`,
		body: {},
	});
});

const KAI_OAUTH2_RETURN_SCHEMA = {
	access_token: "string",
	refresh_token: "string",
};

/**
 * The OAuth2 callback used by Kai to send an intermediate token to.
 * @note The way this is implemented is *really* weird due to the fact that
 * the tachi-server code cannot have any knowledge of the tachi-client code,
 * and the two must be agnostic.
 *
 * This means the tachi-client will handle the redirecting, and will check
 * query params for ?code=12345 to know when to POST us with the code
 * to perform an update.
 *
 * @param code - An intermediate code to use to get the real auth token.
 *
 * @name POST /api/v1/users/:userID/integrations/kai/:kaiType/oauth2callback
 */
router.post(
	"/oauth2callback",
	prValidate({ code: "string" }, {}, { allowExcessKeys: true }),
	async (req, res) => {
		const user = GetTachiData(req, "requestedUser");
		const kaiType = NotNullish(req.params.kaiType).toUpperCase() as "EAG" | "FLO" | "MIN";

		const body = req.safeBody as {
			code: string;
		};

		const baseUrl = KaiTypeToBaseURL(kaiType);

		const maybeCredentials = GetKaiTypeClientCredentials(kaiType);

		if (!maybeCredentials) {
			logger.severe(
				`Attempted to /callback ${kaiType}, but this server has no oauth2 credentials configured for that type.`
			);
			return res.status(500).json({
				success: false,
				description: `A fatal error has occured, This has been reported.`,
			});
		}

		const { CLIENT_SECRET, CLIENT_ID, REDIRECT_URI } = maybeCredentials;

		const url = new URL(`${baseUrl}/oauth/token`);

		url.searchParams.append("code", body.code);
		url.searchParams.append("grant_type", "authorization_code");
		url.searchParams.append("client_secret", CLIENT_SECRET);
		url.searchParams.append("client_id", CLIENT_ID);
		url.searchParams.append("redirect_uri", REDIRECT_URI);

		logger.info(`Making token reify request from ${baseUrl}/oauth/token`);
		let getTokenRes;

		try {
			// this also isn't a POST??
			getTokenRes = await fetch(url.href);
		} catch (err) {
			logger.error(`Completely failed to getTokenRes from ${url.href}.`, err);
			return res.status(500).json({
				success: false,
				description: `We failed to reach this site. Are they down?`,
			});
		}

		if (getTokenRes.status !== 200) {
			logger.error(
				`Unexpected status of ${getTokenRes.status} from ${url.href} oauth2 flow.`
			);

			return res.status(getTokenRes.status < 500 ? 400 : 500).json({
				success: false,
				description: `The server you requested returned a status of ${getTokenRes.status}. Either your request was malformed, or the server is malfunctioning.`,
			});
		}

		let json: unknown;

		try {
			json = await getTokenRes.json();
		} catch (err) {
			logger.error(`Error parsing JSON in response body from getTokenRes.`, {
				res: getTokenRes,
				err,
			});

			return res.status(500).json({
				success: false,
				description: `Failed to parse JSON returned from this service. Is their server malfunctioning?`,
			});
		}

		const err = p(json, KAI_OAUTH2_RETURN_SCHEMA, {}, { allowExcessKeys: true });

		if (err) {
			logger.error(`Validation error in JSON return from ${url.href}.`, { err });
			return res.status(500).json({
				success: false,
				description: `Failed to validate JSON returned from this service. Is their server malfunctioning?`,
			});
		}

		const j = json as { access_token: string; refresh_token: string };

		await db["kai-auth-tokens"].update(
			{
				userID: user.id,
				service: kaiType,
			},
			{
				$set: {
					userID: user.id,
					service: kaiType,
					refreshToken: j.refresh_token,
					token: j.access_token,
				},
			},
			{
				upsert: true,
			}
		);

		logger.info(`Updated Auth for ${kaiType} for user ${FormatUserDoc(user)}.`);

		return res.status(200).json({
			success: true,
			description: `Successfully updated auth for ${kaiType}`,
			body: {},
		});
	}
);

export default router;
