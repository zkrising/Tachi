import db from "../../../../external/mongo/db";
import {
    ConverterFunction,
    ConverterFnReturnOrFailure,
    ImportTypeContextMap,
    ImportTypeDataMap,
    OrphanScoreDocument,
} from "../../import-types/common/types";
import { ImportTypes, integer } from "kamaitachi-common";
import fjsh from "fast-json-stable-hash";
import { KtLogger } from "../../../logger/logger";
import { Converters } from "../../import-types/converters";
import {
    ConverterFailure,
    InternalFailure,
    KTDataNotFoundFailure,
} from "../common/converter-failures";
import { ProcessSuccessfulConverterReturn } from "../score-importing/score-importing";

/**
 * Creates an OrphanedScore document from the data and context,
 * and inserts it into the DB if it is not already in there.
 *
 * @returns True if the score was inserted, False if it wasn't.
 */
export async function OrphanScore<T extends ImportTypes = ImportTypes>(
    importType: T,
    userID: integer,
    data: ImportTypeDataMap[T],
    context: ImportTypeContextMap[T],
    errMsg: string | null,
    logger: KtLogger
) {
    const orphan: Pick<
        OrphanScoreDocument,
        "importType" | "data" | "converterContext" | "userID"
    > = {
        importType,
        data,
        converterContext: context,
        userID,
    };

    const orphanID = `O${fjsh.hash(orphan, "sha256")}`;

    const exists = await db["orphan-scores"].findOne({ orphanID });

    if (exists) {
        logger.debug(`Skipped orphaning score ${orphanID} because it already exists.`);
        return false;
    }

    const orphanScoreDoc: OrphanScoreDocument = {
        ...orphan,
        orphanID,
        errMsg,
        timeInserted: Date.now(),
    };

    await db["orphan-scores"].insert(orphanScoreDoc);

    return true;
}

/**
 * Takes an orphan document and re-runs the converter->scoreimport pipeline on its data.
 *
 * @returns False if no parent documents could be found for the score again,
 * Null if the orphan document was removed, but no score was inserted (i.e. score was orphaned AND invalid, so nothing
 * could be imported when parents were found).
 * ImportProcessingInfo on success.
 */
export async function ReprocessOrphan(orphan: OrphanScoreDocument, logger: KtLogger) {
    const ConverterFunction = Converters[orphan.importType] as ConverterFunction<
        ImportTypeDataMap[ImportTypes],
        ImportTypeContextMap[ImportTypes]
    >;

    let res: ConverterFnReturnOrFailure;

    try {
        res = await ConverterFunction(
            orphan.data,
            orphan.converterContext,
            orphan.importType,
            logger
        );
    } catch (err) {
        if (!(err instanceof ConverterFailure)) {
            logger.error(`Converter function ${orphan.importType} returned unexpected error.`, {
                err,
            });
            throw err; // throw this higher up, i guess.
        }

        res = err;
    }

    // If the data still can't be found, we do nothing about it.
    if (res instanceof KTDataNotFoundFailure) {
        logger.debug(`Unorphaning ${orphan.orphanID} failed. (${res.message})`);
        return false;
    } else if (res instanceof InternalFailure) {
        logger.error(`Orphan Internal Failure - ${res.message}, OrphanID ${orphan.orphanID}`);

        return false;
    } else if (res instanceof ConverterFailure) {
        logger.warn(
            `Recieved ConverterFailure ${res.message} on orphan ${orphan.orphanID}. Removing orphan.`
        );

        // @danger - This could go terribly, if there's a mistake in the converterFN we might accidentally
        // remove a users score.
        await db["orphan-scores"].remove({ orphanID: orphan.orphanID });

        return null;
    }

    await db["orphan-scores"].remove({ orphanID: orphan.orphanID });

    // else, import the orphan.
    return ProcessSuccessfulConverterReturn(orphan.userID, res, logger);
}
