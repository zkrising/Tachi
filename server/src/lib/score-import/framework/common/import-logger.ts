import { KtLogger, rootLogger } from "lib/logger/logger";
import { ImportTypes, PublicUserDocument } from "tachi-common";
import { FormatUserDoc } from "utils/user";

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
