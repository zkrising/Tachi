import {
    AnyChartDocument,
    ChartDocument,
    ImportProcessingInfo,
    integer,
    ScoreDocument,
    SongDocument,
} from "kamaitachi-common";
import { DryScore, ConverterFunction, ConverterFnReturn } from "../../../types";
import HydrateScore from "../core/hydrate-score";
import { QueueScoreInsert } from "../core/insert-score";
import {
    ConverterFailure,
    InternalFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../core/converter-errors";
import { CreateScoreID } from "../core/score-id";
import db from "../../../db/db";
import { Logger } from "winston";
import { AppendLogCtx } from "../../../logger";

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
    iterableData: Iterable<D> | AsyncIterable<D>,
    ConverterFunction: ConverterFunction<D, C>,
    context: C,
    logger: Logger
): Promise<ImportProcessingInfo[]> {
    logger.verbose(`Starting Data Processing...`);

    const promises = [];

    // for await is used here as iterableData
    // may be an async iterable
    // An example would be making an api request after exhausting
    // the first set of data.
    for await (const data of iterableData) {
        promises.push(ImportIterableDatapoint(userID, data, ConverterFunction, context, logger));
    }

    // Due to the fact that ProcessIterableDatapoint may return an array instead of a single result
    // (e-amusement is the only real example of this);
    // we need to flatten out the datapoints into a single array. We also use this time
    // to filter out nulls, which we don't care for (these are neither successes or failures)
    let nonFlatDatapoints = await Promise.all(promises);

    logger.verbose(`Finished Importing Data (${promises.length} datapoints).`);
    logger.verbose(`Flattening returns...`);

    let flatDatapoints = [];

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

    logger.verbose(`Flattened returns.`);

    logger.verbose(`Recieved ${flatDatapoints.length} returns, from ${promises.length} data.`);

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
    data: D,
    ConverterFunction: ConverterFunction<D, C>,
    context: C,
    logger: Logger
) {
    const converterReturns = await ConverterFunction(data, context, logger);

    logger.debug("Converter Function Finished");

    if (Array.isArray(converterReturns)) {
        return Promise.all(
            converterReturns.map((e) => ImportFromConverterReturn(userID, e, logger))
        );
    }

    return ImportFromConverterReturn(userID, converterReturns, logger);
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
    song: SongDocument,
    importLogger: Logger
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
        logger.debug(`Skipped existing score ${scoreID}.`);
        return null;
    }

    const score = await HydrateScore(userID, dryScore, chart, song, scoreID, logger);

    await QueueScoreInsert(score);

    return score;
}

async function ImportFromConverterReturn(
    userID: integer,
    cfnReturn: ConverterFnReturn, // a single return, not an array!
    logger: Logger
): Promise<ImportProcessingInfo | null> {
    // null => processing didnt result in a score document, but not an error, no processing needed!
    if (cfnReturn === null) {
        return null;
    }

    // if this conversion failed, return it in the proper format
    if (cfnReturn instanceof ConverterFailure) {
        if (cfnReturn instanceof KTDataNotFoundFailure) {
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
            return {
                success: false,
                type: "InvalidDatapoint",
                message: cfnReturn.message,
                content: {},
            };
        } else if (cfnReturn instanceof InternalFailure) {
            return {
                success: false,
                type: "InternalError",
                message: cfnReturn.message,
                content: {},
            };
        } else {
            logger.warn(`Unknown error returned as ConverterFailure, Ignoring.`, {
                err: cfnReturn,
            });
            return null; // lets not crash the entire import, but, this is weird.
        }
    }

    let result = await HydrateAndInsertScore(
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

    return {
        success: true,
        type: "ScoreImported",
        message: null,
        content: {
            score: result,
        },
    };
}
