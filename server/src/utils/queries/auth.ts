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

export function GetMYTAuth(userID: integer) {
	return db["myt-auth-tokens"].findOne({ userID });
}

export function RevokeMYTAuth(userID: integer) {
	return db["myt-auth-tokens"].remove({ userID });
}

export async function GetMYTAuthGuaranteed(userID: integer, logger: KtLogger) {
	const authDoc = await GetMYTAuth(userID);

	if (!authDoc) {
		logger.error(`No authentication was stored for MYT.`);
		throw new ScoreImportFatalError(401, `No authentication was stored for MYT.`);
	}

	return authDoc;
}
