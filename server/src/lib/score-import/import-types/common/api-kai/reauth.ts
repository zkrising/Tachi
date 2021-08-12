import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { GetKaiTypeClientCredentials, KaiTypeToBaseURL } from "./utils";
import nodeFetch from "utils/fetch";
import p from "prudence";
import { KaiAuthDocument } from "tachi-common";

const REAUTH_SCHEMA = {
	access_token: "string",
	refresh_token: "string",
};

export function CreateKaiReauthFunction(
	kaiType: "FLO" | "EAG" | "MIN",
	authDoc: KaiAuthDocument,
	logger: KtLogger,
	fetch = nodeFetch
) {
	const maybeCredentials = GetKaiTypeClientCredentials(kaiType);

	/* istanbul ignore next */
	if (!maybeCredentials) {
		logger.error(
			`No CLIENT_ID or CLIENT_SECRET was configured for ${kaiType}. Cannot create reauth function.`
		);
		throw new ScoreImportFatalError(
			500,
			`Fatal error in performing authentication. This has been reported.`
		);
	}

	const { CLIENT_ID, CLIENT_SECRET } = maybeCredentials;

	return async () => {
		let res;
		try {
			res = await fetch(
				`${KaiTypeToBaseURL(kaiType)}/oauth/token?refresh_token=${
					authDoc.refreshToken
				}&grant_type=refresh_token&client_secret=${CLIENT_SECRET}&client_id=${CLIENT_ID}`
			);
		} catch (err) {
			logger.error(`Unexpected error while fetching reauth?`, { res, err });
			throw new ScoreImportFatalError(
				500,
				"An error has occured while attempting reauthentication."
			);
		}

		/* istanbul ignore next */
		if (res.status !== 200) {
			logger.error(`Unexpected ${res.status} error while fetching reauth?`, { res });
			throw new ScoreImportFatalError(
				500,
				"An error has occured while attempting reauthentication."
			);
		}

		let json;
		/* istanbul ignore next */
		try {
			json = await res.json();
		} catch (err) {
			logger.error(`Invalid JSON body in successful reauth response.`, { res, err });
			throw new ScoreImportFatalError(
				500,
				"An error has occured while attempting reauthentication."
			);
		}

		const err = p(json, REAUTH_SCHEMA, {}, { allowExcessKeys: true, throwOnNonObject: false });

		if (err) {
			logger.error(`Invalid JSON body in successful reauth response.`, { err, json });
			throw new ScoreImportFatalError(
				500,
				"An error has occured while attempting reauthentication."
			);
		}

		await db["kai-auth-tokens"].update(
			{
				userID: authDoc.userID,
				service: authDoc.service,
			},
			{
				$set: {
					refreshToken: json.refresh_token,
					token: json.access_token,
				},
			}
		);

		return json.access_token;
	};
}
