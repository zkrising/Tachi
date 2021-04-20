import { ImportTypes, KTBlackImportDocument, PublicUserDocument } from "kamaitachi-common";
import { ImportInputParser } from "../../types";
import { InsertQueue } from "./core/insert-score";
import { ImportAllIterableData } from "./importing/score-importing";
import { CreateImportLoggerAndID } from "./core/import-logger";

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>
) {
    const timeStarted = Date.now();
    const { importID, logger } = CreateImportLoggerAndID(user, importType);

    const { iterable, ConverterFunction, context, idStrings } = await InputParser(logger);

    // @todo: scope logger properly
    logger.verbose("Received import request.");

    let importInfo = await ImportAllIterableData(
        user.id,
        iterable,
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
        createdSessions: [], // @todo, see session ctor
        userID: user.id,
    };

    logger.info(
        `Import took: ${ImportDocument.timeFinished - timeStarted}ms, with ${
            importInfo.length
        } documents. Aprx ${(ImportDocument.timeFinished - timeStarted) / importInfo.length}ms/doc`
    );

    // Add this to the imports database
    // @todo

    return ImportDocument;
}
