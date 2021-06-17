import {
    ImportProcessingInfo,
    ImportTypes,
    ImportDocument,
    PublicUserDocument,
    Playtypes,
    Game,
    integer,
    IDStrings,
} from "tachi-common";
import { KtLogger } from "../../logger/logger";
import { ImportAllIterableData } from "./score-importing/score-importing";
import { CreateImportLoggerAndID } from "./common/import-logger";
import { CreateSessions } from "./sessions/sessions";
import { GetMilisecondsSince } from "../../../utils/misc";
import { ProcessPBs } from "./pb/process-pbs";
import { UpdateUsersGamePlaytypeStats } from "./user-game-stats/update-ugs";
import db from "../../../external/mongo/db";
import { GetAndUpdateUsersGoals } from "./goals/goals";
import { UpdateUsersMilestones } from "./milestones/milestones";
import { ConverterFunction, ImportInputParser } from "../import-types/common/types";
import { ScorePlaytypeMap } from "./common/types";
import { Converters } from "../import-types/converters";
import { ClassHandler } from "./user-game-stats/types";
import { GetOrSetUserLock, RemoveUserLock } from "./import-locks/lock";
import ScoreImportFatalError from "./score-importing/score-import-error";

/**
 * Performs a Score Import.
 */
export default async function ScoreImportMain<D, C>(
    user: PublicUserDocument,
    userIntent: boolean,
    importType: ImportTypes,
    InputParser: ImportInputParser<D, C>,
    providedImportObjects?: { logger: KtLogger; importID: string }
) {
    // in the event of any error, we remove the user lock.
    try {
        const lock = await GetOrSetUserLock(user.id);

        if (lock) {
            // @danger
            // Throwing away an import if the user already has one outgoing is *bad*, as in the case
            // of degraded performance we might just start throwing scores away. This is obviously
            // not great, but any other solution involves making a queue, which can't be done because
            // InputParser is a very dynamic function that cannot be stored in redis or something.
            //
            // Under normal circumstances, there is no scenario where a user would have two ongoing
            // imports at the same time - even if they were using single-score imports on a 5 second
            // chart, as each score import takes only around ~10-15miliseconds.
            throw new ScoreImportFatalError(409, "This user already has an ongoing import.");
        }

        const timeStarted = Date.now();
        let importID;
        let logger;

        if (!providedImportObjects) {
            // If they weren't given to us -
            // we create an "import logger".
            // this holds a reference to the user's name, ID, and type
            // of score import for any future debugging.
            ({ importID, logger } = CreateImportLoggerAndID(user, importType));
            logger.debug("Received import request.");
        } else {
            ({ importID, logger } = providedImportObjects);
        }

        // --- 1. Parsing ---
        // We get an iterable from the provided parser function, alongside some context and a converter function.
        // This iterable does not have to be an array - it's anything that's iterable, like a generator.
        const parseTimeStart = process.hrtime.bigint();
        const { iterable, context, game, classHandler } = await InputParser(logger);

        const parseTime = GetMilisecondsSince(parseTimeStart);

        logger.debug(`Parsing took ${parseTime} miliseconds.`);

        // We have to cast here due to typescript generic confusions. This is guaranteed` to be correct.
        const ConverterFunction = Converters[importType] as unknown as ConverterFunction<D, C>;

        // --- 2. Importing ---
        // ImportAllIterableData iterates over the iterable, applying the converter function to each bit of data.
        const importTimeStart = process.hrtime.bigint();
        const importInfo = await ImportAllIterableData(
            user.id,
            importType,
            iterable,
            ConverterFunction,
            context,
            logger
        );

        const importTime = GetMilisecondsSince(importTimeStart);
        const importTimeRel = importTime / importInfo.length;

        logger.debug(`Importing took ${importTime} miliseconds. (${importTimeRel}ms/doc)`);

        // --- 3. ParseImportInfo ---
        // ImportInfo is a relatively complex structure. We need some information from it for subsequent steps
        // such as the list of chartIDs involved in this import.
        const importParseTimeStart = process.hrtime.bigint();
        const { scorePlaytypeMap, errors, scoreIDs, chartIDs } = ParseImportInfo(importInfo);

        const importParseTime = GetMilisecondsSince(importParseTimeStart);
        const importParseTimeRel = importParseTime / importInfo.length;

        logger.debug(
            `Import Parsing took ${importParseTime} miliseconds. (${importParseTimeRel}ms/doc)`
        );

        // --- 4. Sessions ---
        // We create (or update existing) sessions here. This uses the aforementioned parsed import info
        // to determine what goes where.
        const sessionTimeStart = process.hrtime.bigint();
        const sessionInfo = await CreateSessions(
            user.id,
            importType,
            game,
            scorePlaytypeMap,
            logger
        );

        const sessionTime = GetMilisecondsSince(sessionTimeStart);
        const sessionTimeRel = sessionTime / sessionInfo.length;

        logger.debug(
            `Session Processing took ${sessionTime} miliseconds (${sessionTimeRel}ms/doc).`
        );

        // --- 5. PersonalBests ---
        // We want to keep an updated reference of a users best score on a given chart.
        // This function also handles conjoining different scores together (such as unioning best lamp and
        // best score).
        const pbTimeStart = process.hrtime.bigint();
        await ProcessPBs(user.id, chartIDs, logger);

        const pbTime = GetMilisecondsSince(pbTimeStart);
        const pbTimeRel = pbTime / chartIDs.size;

        logger.debug(`PB Processing took ${pbTime} miliseconds (${pbTimeRel}ms/doc)`);

        const playtypes = Object.keys(scorePlaytypeMap) as Playtypes[Game][];

        // --- 6. Game Stats ---
        // This function updates the users "stats" for this game - such as their profile rating or their classes.
        const ugsTimeStart = process.hrtime.bigint();
        const classDeltas = await UpdateUsersGameStats(
            game,
            playtypes,
            user.id,
            classHandler,
            logger
        );

        const ugsTime = GetMilisecondsSince(ugsTimeStart);

        logger.debug(`UGS Processing took ${ugsTime} miliseconds.`);

        // --- 7. Goals ---
        // Evaluate and update the users goals. This returns information about goals that have changed.
        const goalTimeStart = process.hrtime.bigint();
        const goalInfo = await GetAndUpdateUsersGoals(game, user.id, chartIDs, logger);

        const goalTime = GetMilisecondsSince(goalTimeStart);

        logger.debug(`Goal Processing took ${goalTime} miliseconds.`);

        // --- 8. Milestones ---
        // Evaluate and update the users milestones. This returns...
        const milestoneTimeStart = process.hrtime.bigint();
        const milestoneInfo = await UpdateUsersMilestones(
            goalInfo,
            game,
            playtypes,
            user.id,
            logger
        );

        const milestoneTime = GetMilisecondsSince(milestoneTimeStart);

        logger.debug(`Milestone Processing took ${milestoneTime} miliseconds.`);

        // --- 9. Finalise Import Document ---
        // Create and Save an import document to the database, and finish everything up!
        const ImportDocument: ImportDocument = {
            importType,
            idStrings: playtypes.map((e) => `${game}:${e}`) as IDStrings[],
            scoreIDs,
            errors,
            importID,
            timeFinished: Date.now(),
            timeStarted,
            createdSessions: sessionInfo,
            userID: user.id,
            classDeltas,
            goalInfo,
            milestoneInfo,
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

        // we don't await this because we don't
        // particularly care about waiting for it.
        db["import-timings"].insert({
            importID,
            timestamp: Date.now(),
            total: ImportDocument.timeFinished - timeStarted,
            rel: {
                import: importTimeRel,
                importParse: importParseTimeRel,
                pb: pbTimeRel,
                session: sessionTimeRel,
            },
            abs: {
                parse: parseTime,
                import: importTime,
                importParse: importParseTime,
                session: sessionTime,
                pb: pbTime,
                ugs: ugsTime,
                goal: goalTime,
                milestone: milestoneTime,
            },
        });

        await RemoveUserLock(user.id);

        return ImportDocument;
    } catch (err) {
        await RemoveUserLock(user.id);
        throw err;
    }
}

/**
 * Calls UpdateUsersGamePlaytypeStats for every playtype in the import.
 * @returns A flattened array of ClassDeltas
 */
async function UpdateUsersGameStats(
    game: Game,
    playtypes: Playtypes[Game][],
    userID: integer,
    classHandler: ClassHandler | null,
    logger: KtLogger
) {
    const promises = [];

    for (const pt of playtypes) {
        promises.push(UpdateUsersGamePlaytypeStats(game, pt, userID, classHandler, logger));
    }

    const r = await Promise.all(promises);
    return r.flat(1);
}

/**
 * Parses the return of ImportProcessingInfo into relevant information
 * for the rest the import.
 * @returns The list of scoreIDs used in the import, the list of errors
 * A set of unique chartIDs involved in the import and the scores mapped
 * on their playtype.
 */
function ParseImportInfo(importInfo: ImportProcessingInfo[]) {
    const scorePlaytypeMap: ScorePlaytypeMap = Object.create(null);

    const scoreIDs = [];
    const errors = [];
    const chartIDs: Set<string> = new Set();

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
