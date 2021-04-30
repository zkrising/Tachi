import { ImportTypes, PublicUserDocument } from "kamaitachi-common";
import { CreateScoreLogger } from "../../../logger";
import crypto from "crypto";

export function CreateImportLoggerAndID(userDoc: PublicUserDocument, importType: ImportTypes) {
    const importID = crypto.randomBytes(20).toString("hex");
    return { logger: CreateScoreLogger(userDoc, importID, importType), importID };
}
