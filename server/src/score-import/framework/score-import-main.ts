import {
    IDStrings,
    ImportTypes,
    KTBlackImportDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import { ConverterFunction } from "../../types";
import { InsertQueue } from "./core/insert-score";
import { ImportAllIterableData } from "./importing/score-importing";
import { CreateImportLoggerAndID } from "./core/import-logger";

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    importType: ImportTypes,
    idStrings: [IDStrings] & IDStrings[],
    iterableData: Iterable<D> | AsyncIterable<D>,
    ConverterFunction: ConverterFunction<D, C>,
    context: C
) {
    const timeStarted = Date.now();
    const { importID, logger } = CreateImportLoggerAndID(user, importType);

    // @todo: scope logger properly
    logger.verbose("Received import request.");

    let importInfo = await ImportAllIterableData(
        user.id,
        iterableData,
        ConverterFunction,
        context,
        logger
    );

    // Empty anything in the score queue
    let emptied = await InsertQueue();
    logger.verbose(`Emptied ${emptied} documents from score queue`);

    // Update user's rating information
    // @todo

    // Construct sessions from successful scores
    // @todo

    // Create import document
    const ImportDocument: KTBlackImportDocument = {
        importType,
        idStrings: idStrings,
        importInfo,
        importID,
        timeFinished: Date.now(),
        timeStarted,
        userID: user.id,
    };

    return ImportDocument;
}
