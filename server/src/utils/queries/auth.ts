import db from "external/mongo/db";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";

export function GetKaiAuth(userID: integer, service: "EAG" | "FLO" | "MIN") {
	return db["kai-auth-tokens"].findOne({
		userID,
		service,
	});
}

export function RevokeKaiAuth(userID: integer, service: "EAG" | "FLO" | "MIN") {
	return db["kai-auth-tokens"].remove({
		userID,
		service,
	});
}

export async function GetKaiAuthGuaranteed(
	userID: integer,
	service: "EAG" | "FLO" | "MIN",
	logger: KtLogger
) {
	const authDoc = await GetKaiAuth(userID, service);

	if (!authDoc) {
		logger.error(`No authentication was stored for ${service}.`);
		throw new ScoreImportFatalError(401, `No authentication was stored for ${service}.`);
	}

	return authDoc;
}

export function GetMAITAuth(userID: integer) {
	return db["mait-auth-tokens"].findOne({ userID });
}

export function RevokeMAITAuth(userID: integer) {
	return db["mait-auth-tokens"].remove({ userID });
}

export async function GetMAITAuthGuaranteed(userID: integer, logger: KtLogger) {
	const authDoc = await GetMAITAuth(userID);

	if (!authDoc) {
		logger.error(`No authentication was stored for MAIT.`);
		throw new ScoreImportFatalError(401, `No authentication was stored for MAIT.`);
	}

	return authDoc;
}
