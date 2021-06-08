// @todo #118

import { RequestHandler } from "express";
import multer, { MulterError } from "multer";
import CreateLogCtx from "../../lib/logger/logger";
import { integer } from "kamaitachi-common";
import { SIXTEEN_MEGABTYES } from "../../lib/constants/filesize";

const defaultLogger = CreateLogCtx(__filename);

export const DefaultMulterUpload = multer({ limits: { fileSize: 1024 * 1024 * 16 } }); // 16MB

export const CreateMulterSingleUploadMiddleware = (
    fieldName: string,
    fileSize: integer = SIXTEEN_MEGABTYES,
    logger = defaultLogger
): RequestHandler => {
    const UploadMW = multer({ limits: { fileSize } }).single(fieldName);

    return (req, res, next) => {
        UploadMW(req, res, (err: unknown) => {
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

            return next();
        });
    };
};
