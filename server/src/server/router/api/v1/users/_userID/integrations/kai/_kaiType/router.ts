import { Router } from "express";
import CreateLogCtx from "lib/logger/logger";
import {
	GetKaiTypeClientCredentials,
	KaiTypeToBaseURL,
} from "lib/score-import/import-types/common/api-kai/utils";
import prValidate from "server/middleware/prudence-validate";
import { ValidateKaiType } from "./middleware";
import p from "prudence";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { FormatUserDoc } from "utils/user";
import { GetKaiAuth } from "utils/queries/auth";
import { RequireSelfRequestFromUser } from "../../../middleware";
import { RequireKamaitachi } from "server/middleware/type-require";
import fetch from "utils/fetch";
import { Random20Hex } from "utils/misc";

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const kaiType = req.params.kaiType.toUpperCase() as "FLO" | "EAG" | "MIN";

	const authDoc = await GetKaiAuth(user.id, kaiType);

	return res.status(200).json({
		success: true,
		description: authDoc ? `User is authenticated.` : `User is unauthenticated.`,
		body: {
			authStatus: !!authDoc,
		},
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
		const user = req[SYMBOL_TachiData]!.requestedUser!;
		const kaiType = req.params.kaiType.toUpperCase() as "FLO" | "EAG" | "MIN";

		if (process.env.NODE_ENV === "dev") {
			await db["kai-auth-tokens"].update(
				{
					userID: user.id,
					service: kaiType,
				},
				{
					$set: {
						userID: user.id,
						service: kaiType,
						refreshToken: Random20Hex(),
						token: Random20Hex(),
					},
				},
				{
					upsert: true,
				}
			);

			logger.warn(
				`Cannot use kai OAuth2 in development. This endpoint has been stubbed out.`
			);

			return res.status(200).json({
				success: true,
				description: `Successfully updated auth for ${kaiType}`,
				body: {},
			});
		}

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

		url.searchParams.append("code", req.body.code);
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
			logger.error(`Completely failed to getTokenRes from ${baseUrl}/oauth/token.`, err);
			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		if (getTokenRes.status !== 200) {
			logger.error(
				`Unexpected status of ${getTokenRes.status} from ${url.href} oauth2 flow.`
			);

			return res.status(500).json({
				success: false,
				description: `A fatal error has occured, This has been reported.`,
			});
		}

		let json;
		try {
			json = await getTokenRes.json();
		} catch (err) {
			logger.error(`Error parsing JSON in response body from getTokenRes.`, {
				res: getTokenRes,
				err,
			});

			return res.status(500).json({
				success: false,
				description: `A fatal error has occured, This has been reported.`,
			});
		}

		const err = p(json, KAI_OAUTH2_RETURN_SCHEMA, {}, { allowExcessKeys: true });

		if (err) {
			logger.error(`Validation error in JSON return from ${url.href}.`, { err });
			return res.status(500).json({
				success: false,
				description: `A fatal error has occured, This has been reported.`,
			});
		}

		await db["kai-auth-tokens"].update(
			{
				userID: user.id,
				service: kaiType,
			},
			{
				$set: {
					userID: user.id,
					service: kaiType,
					refreshToken: json.refresh_token,
					token: json.access_token,
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
