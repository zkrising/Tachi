import crypto from "crypto";
import { KtLogger, rootLogger } from "lib/logger/logger";
import { ImportTypes, PublicUserDocument } from "tachi-common";
import { FormatUserDoc } from "utils/user";

export function CreateImportLoggerAndID(userDoc: PublicUserDocument, importType: ImportTypes) {
	const importID = crypto.randomBytes(20).toString("hex");
	return { logger: CreateScoreLogger(userDoc, importID, importType), importID };
}

export function CreateScoreLogger(
	user: PublicUserDocument,
	importID: string,
	importType: ImportTypes
): KtLogger {
	const meta = {
		context: ["Score Import", importType, FormatUserDoc(user)],
		importID,
	};

	// used so appendLogCtx works
	const childLogger = rootLogger.child(meta);

	childLogger.defaultMeta = meta;

	return childLogger as KtLogger;
}
