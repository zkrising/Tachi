import { Router, NextFunction, Request, Response } from "express";
import { FileUploadImportTypes } from "kamaitachi-common";
import { fileImportTypes } from "kamaitachi-common/js/config";
import multer, { MulterError } from "multer";
import Prudence from "prudence";
import { Logger } from "winston";
import { GetUserWithID } from "../../core/user-core";
import CreateLogCtx from "../../logger";
import prValidate from "../../middleware/prudence-validate";
import { RequireLoggedIn } from "../../middleware/require-logged-in";
import ScoreImportFatalError from "../../score-import/framework/core/score-import-error";
import ScoreImportMain from "../../score-import/framework/score-import-main";
import ParseEamusementCSV from "../../score-import/import-types/csv-eamusement-iidx/parser";

const logger = CreateLogCtx("import.ts");

const router = Router({ mergeParams: true });

// multer config
const upload = multer({ limits: { fileSize: 1024 * 1024 * 16 } }); // basically 16mb
const uploadMW = upload.single("scoreData");

const parseMultipartScoredata = (req: Request, res: Response, next: NextFunction) => {
    uploadMW(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            logger.info(`Multer Error.`, { err });
            return res.status(400).json({
                success: false,
                description:
                    "File provided was too large, corrupt, or provided in the wrong field.",
            });
        } else if (err) {
            logger.error(`Unknown file import error: ${err}`, { err });
            return res.status(500).json({
                success: false,
                description: `An internal server error has occured.`,
            });
        }

        next();
    });
};

/**
 * Import scores from a file. Expects the post request to be multipart, and to provide a scoreData file.
 * @name /internal-api/import/file
 */
router.post(
    "/file",
    RequireLoggedIn,
    parseMultipartScoredata,
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

        try {
            let importType = req.body.importType as FileUploadImportTypes;

            const inputParser = async (logger: Logger) =>
                await ResolveFileUploadData(importType, req.file, req.body, logger);

            const userDoc = await GetUserWithID(req.session.ktchi!.userID);

            if (!userDoc) {
                logger.severe(
                    `User ${req.session.ktchi!.userID} does not have an associated user document.`
                );
                return res.status(500).json({
                    success: false,
                    description: "An internal error has occured.",
                });
            }

            let importDocument = await ScoreImportMain(userDoc, importType, inputParser);

            return res.status(200).json({
                success: true,
                description: "Import successful.",
                body: importDocument,
            });
        } catch (err) {
            if (err instanceof ScoreImportFatalError) {
                logger.info(err.message);
                return res.status(err.statusCode).json({
                    success: false,
                    description: err.message,
                });
            } else {
                logger.error(err);
                return res.status(500).json({
                    success: false,
                    description: `An internal service error has occured.`,
                });
            }
        }
    }
);

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
    logger: Logger
) {
    switch (importType) {
        case "csv:eamusement-iidx":
            return ParseEamusementCSV(fileData, body, logger);
        default:
            logger.error(
                `importType ${importType} made it into ResolveFileUploadData, but should have been rejected by Prudence.`
            );
            throw new ScoreImportFatalError(400, `Invalid importType of ${importType}.`);
    }
}

export default router;
