import {
    ImportProcessingInfo,
    ImportTypes,
    KTBlackImportDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import { ImportInputParser, ScorePlaytypeMap } from "../../types";
import { InsertQueue } from "./core/insert-score";
import { ImportAllIterableData } from "./importing/score-importing";
import { CreateImportLoggerAndID } from "./core/import-logger";
import { Logger } from "winston";
import { CreateSessions } from "./core/sessions/sessions";

function ParseImportInfo(importInfo: ImportProcessingInfo[]) {
    let scorePlaytypeMap: ScorePlaytypeMap = Object.create(null);

    let scoreIDs = [];
    let errors = [];

    for (const info of importInfo) {
        if (info.success) {
            scoreIDs.push(info.content.score.scoreID);

            if (scorePlaytypeMap[info.content.score.playtype]) {
                scorePlaytypeMap[info.content.score.playtype]!.push(info.content.score);
            } else {
                scorePlaytypeMap[info.content.score.playtype] = [info.content.score];
            }
        } else {
            errors.push({ type: info.type, message: info.message });
        }
    }

    return { scoreIDs, errors, scorePlaytypeMap };
}

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>
) {
    const timeStarted = Date.now();
    const { importID, logger } = CreateImportLoggerAndID(user, importType);

    const { iterable, ConverterFunction, context, idStrings, game } = await InputParser(logger);

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

    if (emptied) {
        logger.verbose(`Emptied ${emptied} documents from score queue.`);
    }

    let { scorePlaytypeMap, errors, scoreIDs } = ParseImportInfo(importInfo);

    // Update user's rating information
    // @todo

    let sessionInfo = await CreateSessions(user.id, importType, game, scorePlaytypeMap, logger);

    // Create import document
    const ImportDocument: KTBlackImportDocument = {
        importType,
        idStrings: idStrings,
        scoreIDs,
        errors,
        importID,
        timeFinished: Date.now(),
        timeStarted,
        createdSessions: [], // @todo, see session ctor
        userID: user.id,
    };

    logger.info(
        `Import took: ${ImportDocument.timeFinished - timeStarted}ms, with ${
            importInfo.length
        } documents (Fails: ${errors.length}, Successes: ${scoreIDs.length}). Aprx ${
            (ImportDocument.timeFinished - timeStarted) / importInfo.length
        }ms/doc`
    );

    // Add this to the imports database
    // @todo

    return ImportDocument;
}
