import { Router } from "express";
import { FileUploadImportTypes } from "kamaitachi-common";
import { fileImportTypes } from "kamaitachi-common/js/config";
import Prudence from "prudence";
import { GetUserWithIDGuaranteed } from "../../common/user";
import CreateLogCtx from "../../common/logger";
import prValidate from "../../middleware/prudence-validate";
import { RequireLoggedIn } from "../../middleware/require-logged-in";
import ScoreImportFatalError from "../../score-import/framework/score-importing/score-import-error";
import { KtLogger } from "../../types";
import { ExpressWrappedScoreImportMain } from "../../score-import/framework/express-wrapper";

const logger = CreateLogCtx("import.ts");

const router: Router = Router({ mergeParams: true });

const ParseMultipartScoredata = CreateMulterSingleUploadMiddleware("scoreData", logger);

/**
 * Import scores from a file. Expects the post request to be multipart, and to provide a scoreData file.
 * @name POST /api/import/file
 */
router.post(
    "/file",
    RequireLoggedIn,
    ParseMultipartScoredata,
    prValidate(
        {
            importType: Prudence.isIn(fileImportTypes),
        },
        {},
        { allowExcessKeys: true }
    ),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                description: `No file provided.`,
            });
        }

        const importType = req.body.importType as FileUploadImportTypes;

        const inputParser = (logger: KtLogger) =>
            ResolveFileUploadData(importType, req.file, req.body, logger);

        const userDoc = await GetUserWithIDGuaranteed(req.session.ktchi!.userID);

        // The <any, any> here is deliberate - TS picks the IIDX-CSV generic values
        // for this function call because it sees them first
        // but that is ABSOLUTELY not what is actually occuring.
        // We use this as an override because we know better.
        // see: https://www.typescriptlang.org/play?ts=4.3.0-beta#code/GYVwdgxgLglg9mABAQQDwBUB8AKYc4BciAYvhpgJSIDeiAsAFCKID0LiAJnAKYDOivKCGDBGAX0aMYYKNwBOwAIYRuJMlhqNmzAEaK5RdOMkNQkWAkQAlbkLlgAynAC23UnGxVqW7W0QAHOVtuMA5EKAALGH5o8IjVIN4QABsoRDhgARdVaX8QNOlBbkUwjMQ5RVCXH2YYTOwAWUVIgDoKqudPRFREAAYWgFYvGu1mILskWj0DRAAiQTlpAHNZxAkmbXXRkfGQexpEaaIARgAmAGY14wZGZNt0vfdEAF5rWz3HbPdPAG4TZGwcEe+AoPyAA
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = await ExpressWrappedScoreImportMain<any, any>(
            userDoc,
            true,
            importType,
            inputParser
        );

        return res.status(responseData.statusCode).json(responseData.body);
    }
);

import ParseEamusementIIDXCSV from "../../score-import/import-types/file/eamusement-iidx-csv/parser";
import ParseBatchManual from "../../score-import/import-types/file/batch-manual/parser";
import { ParseSolidStateXML } from "../../score-import/import-types/file/solid-state-squad/parser";
import { ParseMerIIDX } from "../../score-import/import-types/file/mer-iidx/parser";
import ParsePLIIIDXCSV from "../../score-import/import-types/file/pli-iidx-csv/parser";
import { CreateMulterSingleUploadMiddleware } from "../../common/multer";

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
export function ResolveFileUploadData(
    importType: FileUploadImportTypes,
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: KtLogger
) {
    switch (importType) {
        case "file/eamusement-iidx-csv":
            return ParseEamusementIIDXCSV(fileData, body, logger);
        case "file/pli-iidx-csv":
            return ParsePLIIIDXCSV(fileData, body, logger);
        case "file/batch-manual":
            return ParseBatchManual(fileData, body, logger);
        case "file/solid-state-squad":
            return ParseSolidStateXML(fileData, body, logger);
        case "file/mer-iidx":
            return ParseMerIIDX(fileData, body, logger);
        default:
            logger.error(
                `importType ${importType} made it into ResolveFileUploadData, but should have been rejected by Prudence.`
            );
            throw new ScoreImportFatalError(400, `Invalid importType of ${importType}.`);
    }
}

export default router;
