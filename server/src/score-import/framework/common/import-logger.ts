import { ImportTypes, PublicUserDocument } from "kamaitachi-common";
import crypto from "crypto";
import { FormatUserDoc } from "../../../common/user";
import { rootLogger } from "../../../common/logger";
import { KtLogger } from "../../../types";

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
