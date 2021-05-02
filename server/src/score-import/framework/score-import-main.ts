import {
    ImportProcessingInfo,
    ImportTypes,
    KTBlackImportDocument,
    PublicUserDocument,
    Playtypes,
    Game,
    integer,
} from "kamaitachi-common";
import { ImportInputParser, KtLogger, ScorePlaytypeMap } from "../../types";
import { ImportAllIterableData } from "./score-importing/score-importing";
import { CreateImportLoggerAndID } from "./common/import-logger";
import { CreateSessions } from "./sessions/sessions";
import { GetMilisecondsSince } from "../../core/hrtime-core";
import { ProcessPBs } from "./pb/process-pbs";
import { UpdateUsersGamePlaytypeStats } from "./user-game-stats/update-ugs";
import db from "../../db/db";

export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    userIntent: boolean,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>
) {
    const timeStarted = Date.now();

    // We create an "import logger" - this holds a reference to the user's name for any future debugging.
    const { importID, logger } = CreateImportLoggerAndID(user, importType);
    logger.verbose("Received import request.");

    // --- 1. Parsing ---
    // We get an iterable from the provided parser function, alongside some context and a converter function.
    // This iterable does not have to be an array - it's anything that's iterable, like a generator or similar.
    const parseTimeStart = process.hrtime.bigint();
    const { iterable, ConverterFunction, context, idStrings, game } = await InputParser(logger);

    const parseTime = GetMilisecondsSince(parseTimeStart);

    logger.verbose(`Parsing took ${parseTime} miliseconds.`);

    // --- 2. Importing ---
    // ImportAllIterableData iterates over the iterable, applying the converter function to each bit of data.
    const importTimeStart = process.hrtime.bigint();
    let importInfo = await ImportAllIterableData(
        user.id,
        iterable,
        ConverterFunction,
        context,
        logger
    );

    const importTime = GetMilisecondsSince(importTimeStart);

    logger.verbose(
        `Importing took ${importTime} miliseconds. (${importTime / importInfo.length}ms/doc)`
    );

    // --- 3. ParseImportInfo ---
    // ImportInfo is a relatively complex structure. We need some information from it for subsequent steps
    // such as the list of chartIDs involved in this import.
    let { scorePlaytypeMap, errors, scoreIDs, chartIDs } = ParseImportInfo(importInfo);

    // --- 4. Sessions ---
    // We create (or update existing) sessions here. This uses the aforementioned parsed import info
    // to determine what goes where.
    const sessionTimeStart = process.hrtime.bigint();
    let sessionInfo = await CreateSessions(user.id, importType, game, scorePlaytypeMap, logger);

    const sessionTime = GetMilisecondsSince(sessionTimeStart);

    logger.verbose(
        `Session Processing took ${sessionTime} miliseconds (${
            sessionTime / sessionInfo.length
        }ms/doc).`
    );

    // --- 5. PersonalBests ---
    // We want to keep an updated reference of a users best score on a given chart.
    // This function also handles conjoining different scores together (such as unioning best lamp and
    // best score).
    await ProcessPBs(user.id, chartIDs, logger);

    let playtypes = Object.keys(scorePlaytypeMap) as Playtypes[Game][];

    // --- 6. Game Stats ---
    // This function updates the users "stats" for this game - such as their profile rating, or their classes.
    let classDeltas = await UpdateUsersGameStats(game, playtypes, user.id, logger);

    // --- 7. Goals ---
    // @todo

    // --- 8. Finalise Import Document ---
    // Create and Save an import document to the database, and finish everything up!
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
        classDeltas,
        userIntent,
    };

    const logMessage = `Import took: ${ImportDocument.timeFinished - timeStarted}ms, with ${
        importInfo.length
    } documents (Fails: ${errors.length}, Successes: ${scoreIDs.length}, Sessions: ${
        sessionInfo.length
    }). Aprx ${(ImportDocument.timeFinished - timeStarted) / importInfo.length}ms/doc`;

    // I only really want to log "big" imports. The others are here for debugging purposes.
    if (scoreIDs.length > 500) {
        logger.info(logMessage);
    } else if (scoreIDs.length > 1) {
        logger.verbose(logMessage);
    } else {
        logger.debug(logMessage);
    }

    await db.imports.insert(ImportDocument);

    return ImportDocument;
}

async function UpdateUsersGameStats(
    game: Game,
    playtypes: Playtypes[Game][],
    userID: integer,
    logger: KtLogger
) {
    let promises = [];

    for (const pt of playtypes) {
        promises.push(UpdateUsersGamePlaytypeStats(game, pt, userID, null, logger));
    }

    const r = await Promise.all(promises);
    return r.flat(1);
}

function ParseImportInfo(importInfo: ImportProcessingInfo[]) {
    let scorePlaytypeMap: ScorePlaytypeMap = Object.create(null);

    let scoreIDs = [];
    let errors = [];
    let chartIDs: Set<string> = new Set();

    for (const info of importInfo) {
        if (info.success) {
            scoreIDs.push(info.content.score.scoreID);
            chartIDs.add(info.content.score.chartID);

            if (scorePlaytypeMap[info.content.score.playtype]) {
                scorePlaytypeMap[info.content.score.playtype]!.push(info.content.score);
            } else {
                scorePlaytypeMap[info.content.score.playtype] = [info.content.score];
            }
        } else {
            errors.push({ type: info.type, message: info.message });
        }
    }

    return { scoreIDs, errors, scorePlaytypeMap, chartIDs };
}
