import {
    ImportTypes,
    PublicUserDocument,
    SuccessfulAPIResponse,
    UnsuccessfulAPIResponse,
    ImportDocument,
} from "kamaitachi-common";
import { ImportInputParser } from "../import-types/common/types";
import { CreateImportLoggerAndID } from "./common/import-logger";
import ScoreImportMain from "./score-import-main";
import ScoreImportFatalError from "./score-importing/score-import-error";

export interface WrappedAPIResponse {
    statusCode: number;
    body: SuccessfulAPIResponse<ImportDocument> | UnsuccessfulAPIResponse;
}

/**
 * A thin(ish) wrapper for ScoreImportMain which converts thrown
 * errors and import documents into a WrappedAPIResponse, which can
 * be immediately sent with res.json().
 */
export async function ExpressWrappedScoreImportMain<D, C>(
    user: PublicUserDocument,
    userIntent: boolean,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>
): Promise<WrappedAPIResponse> {
    const { importID, logger } = CreateImportLoggerAndID(user, importType);
    logger.debug("Received import request.");

    try {
        const res = await ScoreImportMain(user, userIntent, importType, InputParser, {
            importID,
            logger,
        });

        return {
            statusCode: 200,
            body: {
                success: true,
                description: "Import successful.",
                body: res,
            },
        };
    } catch (err) {
        if (err instanceof ScoreImportFatalError) {
            logger.info(err.message);
            return {
                statusCode: 400,
                body: {
                    success: false,
                    description: err.message,
                },
            };
        }

        logger.error(err);
        return {
            statusCode: 500,
            body: {
                success: false,
                description:
                    "An internal service error has occured. Please do not repeat this request.",
            },
        };
    }
}
