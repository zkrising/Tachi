import ParseEamusementCSV from "../../import-types/iidx-eamusement-csv/parser";
import createLogCtx from "../../../logger";
import ScoreImportFatalError from "../core/score-import-error";
import { FileUploadImportTypes } from "kamaitachi-common";

const logger = createLogCtx("file-upload.ts");

/**
 * Resolves the data from a file upload into an iterable,
 * The appropriate processing function to map that iterable over,
 * and and any context the processing may need (such as playtype)
 *
 * This also performs validation on the type of file uploaded.
 * @param importType - The type of import request this was.
 * @param fileData - The data sent by the user.
 * @param body - Other data passed by the user in the request body.
 */
export async function ResolveFileUploadData(
    importType: FileUploadImportTypes,
    fileData: Express.Multer.File,
    body: Record<string, unknown>
) {
    switch (importType) {
        case "iidx:eamusement-csv":
            return ParseEamusementCSV(fileData, body);
        default:
            logger.error(
                `importType ${importType} made it into ResolveFileUploadData, but should have been rejected by Prudence.`
            );
            throw new ScoreImportFatalError(400, {
                success: false,
                description: `Invalid importType of ${importType}.`,
            });
    }
}
