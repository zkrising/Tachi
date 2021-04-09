import { Router, NextFunction, Request, Response } from "express";
import { FileUploadImportTypes } from "kamaitachi-common";
import multer, { MulterError } from "multer";
import Prudence from "prudence";
import createLogCtx from "../../logger";
import prValidate from "../../middleware/prudence-validate";
import { RequireLoggedIn } from "../../middleware/require-logged-in";
import ScoreImportFatalError from "../../score-import/framework/core/score-import-error";
import { ResolveFileUploadData } from "../../score-import/framework/parsing/file-upload";
import serverConfig from "../../server-config";

const logger = createLogCtx("import.ts");

const router = Router({ mergeParams: true });

// multer config
const upload = multer({ limits: { fileSize: 1024 * 1024 * 16 } }); // basically 16mb
const uploadMW = upload.single("scoreData");

const parseMultipartScoredata = (req: Request, res: Response, next: NextFunction) => {
    uploadMW(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            logger.error(`Multer Error.`, { err });
            return res.status(400).json({
                success: false,
                description: "File provided was too large, corrupt, or simply broken.",
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
    prValidate({
        importType: Prudence.isIn(serverConfig.supportedFileUploads),
    }),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                description: `No file provided.`,
            });
        }

        try {
            let converterInfo = await ResolveFileUploadData(
                req.body.importType as FileUploadImportTypes,
                req.file,
                req.body
            );
        } catch (err) {
            if (err instanceof ScoreImportFatalError) {
                return res.status(err.statusCode).json(err.data);
            }
        }
    }
);

export default router;
