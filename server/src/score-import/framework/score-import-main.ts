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
import { CreateSessions } from "./core/sessions/sessions";
import { GetMilisecondsSince } from "../../core/hrtime-core";

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    userIntent: boolean,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>
) {
    const timeStarted = Date.now();
    const { importID, logger } = CreateImportLoggerAndID(user, importType);
    logger.verbose("Received import request.");

    const parseTimeStart = process.hrtime.bigint();
    const { iterable, ConverterFunction, context, idStrings, game } = await InputParser(logger);

    const parseTime = GetMilisecondsSince(parseTimeStart);

    logger.verbose(`Parsing took ${parseTime} miliseconds.`);

    const importTimeStart = process.hrtime.bigint();

    let importInfo = await ImportAllIterableData(
        user.id,
        iterable,
        ConverterFunction,
        context,
        logger
    );

    // Flush the score queue out after importing.
    let emptied = await InsertQueue();

    if (emptied) {
        logger.verbose(`Emptied ${emptied} documents from score queue.`);
    }

    const importTime = GetMilisecondsSince(importTimeStart);

    logger.verbose(
        `Importing took ${importTime} miliseconds. (${importTime / importInfo.length}ms/doc)`
    );

    let { scorePlaytypeMap, errors, scoreIDs } = ParseImportInfo(importInfo);

    // Update user's rating information
    // @todo

    const sessionTimeStart = process.hrtime.bigint();

    let sessionInfo = await CreateSessions(user.id, importType, game, scorePlaytypeMap, logger);

    const sessionTime = GetMilisecondsSince(sessionTimeStart);

    logger.verbose(
        `Session Processing took ${sessionTime} miliseconds (${
            sessionTime / sessionInfo.length
        }ms/doc).`
    );

    // Update user's PBs and set flags
    // @todo

    // Update user's classes
    // @todo

    // Update user's goals
    // @todo

    // Create import document
    const ImportDocument: KTBlackImportDocument = {
        importType,
        idStrings: idStrings,
        scoreIDs,
        errors,
        importID,
        timeFinished: Date.now(),
        timeStarted,
        createdSessions: sessionInfo,
        userID: user.id,
        userIntent,
    };

    logger.info(
        `Import took: ${ImportDocument.timeFinished - timeStarted}ms, with ${
            importInfo.length
        } documents (Fails: ${errors.length}, Successes: ${scoreIDs.length}, Sessions: ${
            sessionInfo.length
        }). Aprx ${(ImportDocument.timeFinished - timeStarted) / importInfo.length}ms/doc`
    );

    // Add this to the imports database
    // @todo

    return ImportDocument;
}

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
