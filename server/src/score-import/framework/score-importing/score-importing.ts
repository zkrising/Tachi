import {
    AnyChartDocument,
    ImportProcessingInfo,
    integer,
    ScoreDocument,
    AnySongDocument,
    ImportTypes,
} from "kamaitachi-common";
import { HydrateScore } from "./hydrate-score";
import { InsertQueue, QueueScoreInsert, ScoreIDs } from "./insert-score";
import {
    ConverterFailure,
    InternalFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
    SkipScoreFailure,
} from "../common/converter-failures";
import { CreateScoreID } from "./score-id";
import db from "../../../db/db";
import { AppendLogCtx } from "../../../common/logger";
import { KtLogger } from "../../../types";
import {
    ConverterFunctionReturns,
    ConverterFnReturn,
    ConverterFunction,
} from "../../import-types/common/types";
import { DryScore } from "../common/types";

/**
 * Processes the iterable data into the Kamaitachi database.
 * @param userID - The user this score import was for.
 * @param iterableData - The data to iterate upon.
 * @param ConverterFunction - The function needed to convert the data into an IntermediateScore
 * @param context - Any context the Converter may need in order to make decisions.
 * @returns An array of ImportProcessInfo objects.
 */
export async function ImportAllIterableData<D, C>(
    userID: integer,
    importType: ImportTypes,
    iterableData: Iterable<D> | AsyncIterable<D>,
    ConverterFunction: ConverterFunction<D, C>,
    context: C,
    logger: KtLogger
): Promise<ImportProcessingInfo[]> {
    logger.verbose(`Starting Data Processing...`);

    const promises = [];

    // for await is used here as iterableData may be an async iterable
    // An example would be making an api request after exhausting
    // the first set of data.
    for await (const data of iterableData) {
        promises.push(
            ImportIterableDatapoint(userID, importType, data, ConverterFunction, context, logger)
        );
    }

    // Due to the fact that ProcessIterableDatapoint may return an array instead of a single result
    // (e-amusement is the only real example of this);
    // we need to flatten out the datapoints into a single array. We also use this time
    // to filter out nulls, which we don't care for (these are neither successes or failures)
    const nonFlatDatapoints = await Promise.all(promises);

    logger.verbose(`Finished Importing Data (${promises.length} datapoints).`);
    logger.debug(`Flattening returns...`);

    const flatDatapoints = [];

    for (const dp of nonFlatDatapoints) {
        if (dp === null) {
            continue;
        }

        if (Array.isArray(dp)) {
            for (const dpx of dp) {
                if (dpx === null) {
                    continue;
                }

                flatDatapoints.push(dpx);
            }
        } else {
            flatDatapoints.push(dp);
        }
    }

    logger.debug(`Flattened returns.`);

    logger.verbose(`Recieved ${flatDatapoints.length} returns, from ${promises.length} data.`);

    // Flush the score queue out after finishing most of the import. This ensures no scores get left in the
    // queue.
    const emptied = await InsertQueue();

    if (emptied) {
        logger.verbose(`Emptied ${emptied} documents from score queue.`);
    }

    return flatDatapoints;
}

/**
 * Processes a single data object into one or many ImportProcessingInfo objects.
 * @param userID - The user this score is from.
 * @param data - The data to process.
 * @param ConverterFunction - The processor function that takes the data and returns the partialScore(s)
 * @param context - Any context the processor might need that it can not infer from the data object.
 * @returns An array of ImportProcessingInfo objects, or a single ImportProcessingInfo object
 */
export async function ImportIterableDatapoint<D, C>(
    userID: integer,
    importType: ImportTypes,
    data: D,
    ConverterFunction: ConverterFunction<D, C>,
    context: C,
    logger: KtLogger
) {
    let converterReturns: ConverterFunctionReturns;

    try {
        converterReturns = await ConverterFunction(data, context, importType, logger);
    } catch (err) {
        converterReturns = err;
    }

    if (Array.isArray(converterReturns)) {
        return Promise.all(
            converterReturns.map((e) => ImportFromConverterReturn(userID, e, logger))
        );
    }

    return ImportFromConverterReturn(userID, converterReturns, logger);
}

async function ImportFromConverterReturn(
    userID: integer,
    cfnReturn: ConverterFnReturn, // a single return, not an array!
    logger: KtLogger
): Promise<ImportProcessingInfo | null> {
    // null => processing didnt result in a score document, but not an error, no processing needed!
    if (cfnReturn === null) {
        return null;
    }

    // if this conversion failed, return it in the proper format
    if (cfnReturn instanceof ConverterFailure) {
        if (cfnReturn instanceof KTDataNotFoundFailure) {
            logger.warn(`ConverterFailure: ${cfnReturn.message ?? "No message?"}`, {
                cfnReturn,
                hideFromConsole: ["cfnReturn"],
            });
            return {
                success: false,
                type: "KTDataNotFound",
                message: cfnReturn.message,
                content: {
                    context: cfnReturn.converterContext,
                    data: cfnReturn.data,
                },
            };
        } else if (cfnReturn instanceof InvalidScoreFailure) {
            logger.warn(`ConverterFailure: ${cfnReturn.message ?? "No message?"}`, {
                cfnReturn,
                hideFromConsole: ["cfnReturn"],
            });
            return {
                success: false,
                type: "InvalidDatapoint",
                message: cfnReturn.message,
                content: {},
            };
        } else if (cfnReturn instanceof InternalFailure) {
            logger.error(`Internal error occured.`, { cfnReturn });
            return {
                success: false,
                type: "InternalError",
                // could return cfnReturn.message here, but we might want to hide the details of the crash.
                message: "An internal error has occured.",
                content: {},
            };
        } else if (cfnReturn instanceof SkipScoreFailure) {
            return null;
        } else {
            logger.warn(`Unknown error returned as ConverterFailure, Ignoring.`, {
                err: cfnReturn,
            });
            return {
                success: false,
                type: "InternalError",
                message: "An internal service error has occured.",
                content: {},
            };
        }
    }

    const result = await HydrateAndInsertScore(
        userID,
        cfnReturn.dryScore,
        cfnReturn.chart,
        cfnReturn.song,
        logger
    );

    // This used to be a ScoreExists error. However, we never actually care about
    // handling ScoreExists errors (they're nobodies issue)
    // so instead, the function will just return null, and we pass that on here.
    if (result === null) {
        return null;
    }

    logger.debug(`Successfully imported score: ${result.scoreID}`);

    return {
        success: true,
        type: "ScoreImported",
        message: null,
        content: {
            score: result,
        },
    };
}

/**
 * Hydrates and inserts a score to the Kamaitachi database.
 * @param userID - The user this score is from.
 * @param dryScore - The score that is to be hydrated and inserted.
 * @param chart - The chart this score is on.
 * @param song - The song this score is on.
 */
async function HydrateAndInsertScore(
    userID: integer,
    dryScore: DryScore,
    chart: AnyChartDocument,
    song: AnySongDocument,
    importLogger: KtLogger
): Promise<ScoreDocument | null> {
    const scoreID = CreateScoreID(userID, dryScore, chart.chartID);

    // sub-context the logger so the below logs are more accurate
    const logger = AppendLogCtx(scoreID, importLogger);

    const existingScore = await db.scores.findOne(
        {
            scoreID,
        },
        {
            // micro-optimisation - mongoDB is significantly faster when returning less fields
            // since we only care about whether we have a score or not here, we can minimise returned
            // fields.
            //
            // feel free to test this yourself! - zkldi (09/04/2021)
            projection: {
                _id: 1,
            },
        }
    );

    if (existingScore) {
        logger.verbose(`Skipped score.`);
        return null;
    }

    if (ScoreIDs.has(scoreID)) {
        logger.verbose(`Skipped score.`);
        return null;
    }

    const score = await HydrateScore(userID, dryScore, chart, song, scoreID, logger);

    const res = await QueueScoreInsert(score);

    // emergency state - this is a last resort for avoiding doubled imports
    if (res === null) {
        logger.verbose(`Skipped score - Race Condition protection triggered.`);
        return null;
    }

    return score;
}
