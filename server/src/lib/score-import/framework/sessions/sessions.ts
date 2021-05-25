import {
    integer,
    ImportTypes,
    ScoreDocument,
    SessionDocument,
    Playtypes,
    PBScoreDocument,
    SessionScoreInfo,
    SessionInfoReturn,
    Game,
} from "kamaitachi-common";
import db from "../../../../external/mongo/db";
import { AppendLogCtx } from "../../../logger/logger";
import { GenerateRandomSessionName } from "./name-generation";
import crypto from "crypto";
import { CreateSessionCalcData } from "./performance-calc";
import { GetScoresFromSession } from "../../../../utils/session";
import { KtLogger } from "../../../../utils/types";
import { ScorePlaytypeMap } from "../common/types";

const TWO_HOURS = 1000 * 60 * 60 * 2;

export async function CreateSessions(
    userID: integer,
    importType: ImportTypes,
    game: Game,
    scorePtMap: ScorePlaytypeMap,
    logger: KtLogger
) {
    const allSessionInfo = [];

    /* eslint-disable no-await-in-loop */
    for (const playtype in scorePtMap) {
        // @ts-expect-error This is my least favourite thing about ts.
        const scores = scorePtMap[playtype] as ScoreDocument[];

        const sessionInfo = await LoadScoresIntoSessions(
            userID,
            importType,
            scores,
            game,
            playtype as Playtypes[Game],
            logger
        );

        allSessionInfo.push(...sessionInfo);
    }
    /* eslint-enable no-await-in-loop */

    return allSessionInfo;
}

function ProcessScoreIntoSessionScoreInfo(
    score: ScoreDocument,
    previousPB: PBScoreDocument | undefined
): SessionScoreInfo {
    if (!previousPB) {
        return {
            scoreID: score.scoreID,
            isNewScore: true,
        };
    }

    return {
        scoreID: score.scoreID,
        isNewScore: false,
        gradeDelta: score.scoreData.gradeIndex - previousPB.scoreData.gradeIndex,
        lampDelta: score.scoreData.lampIndex - previousPB.scoreData.lampIndex,
        percentDelta: score.scoreData.percent - previousPB.scoreData.percent,
        scoreDelta: score.scoreData.score - previousPB.scoreData.score,
    };
}

function CreateSessionID() {
    return `Q${crypto.randomBytes(20).toString("hex")}`;
}

function UpdateExistingSession(
    existingSession: SessionDocument,
    newInfo: SessionScoreInfo[],
    oldScores: ScoreDocument[],
    newScores: ScoreDocument[]
) {
    const allScores = [...oldScores, ...newScores];

    const calculatedData = CreateSessionCalcData(allScores);

    existingSession.calculatedData = calculatedData;
    existingSession.scoreInfo = [...existingSession.scoreInfo, ...newInfo];

    if (newScores[0].timeAchieved! < existingSession.timeStarted) {
        existingSession.timeStarted = newScores[0].timeAchieved!;
    }

    if (newScores[newScores.length - 1].timeAchieved! > existingSession.timeEnded) {
        existingSession.timeEnded = newScores[newScores.length - 1].timeAchieved!;
    }

    return existingSession;
}

function CreateSession(
    userID: integer,
    importType: ImportTypes,
    groupInfo: SessionScoreInfo[],
    groupScores: ScoreDocument[],
    game: Game,
    playtype: Playtypes[Game]
): SessionDocument {
    const name = GenerateRandomSessionName();

    const calculatedData = CreateSessionCalcData(groupScores);

    return {
        userID,
        importType,
        name,
        sessionID: CreateSessionID(),
        desc: null,
        game,
        playtype,
        highlight: false,
        scoreInfo: groupInfo,
        timeInserted: Date.now(),
        timeStarted: groupScores[0].timeAchieved!,
        timeEnded: groupScores[groupScores.length - 1].timeAchieved!,
        calculatedData,
    };
}

export async function LoadScoresIntoSessions(
    userID: integer,
    importType: ImportTypes,
    importScores: ScoreDocument[],
    game: Game,
    playtype: Playtypes[Game],
    baseLogger: KtLogger
): Promise<SessionInfoReturn[]> {
    const logger = AppendLogCtx("Session Generation", baseLogger);

    const timestampedScores = [];

    for (const score of importScores) {
        if (!score.timeAchieved) {
            logger.verbose(`Ignored score ${score.scoreID}, as it had no timeAchieved.`);
            // ignore scores without timestamps. We can't use these for sessions.
            continue;
        }

        timestampedScores.push(score);
    }

    // If we have nothing to work with, why bother?
    if (timestampedScores.length === 0) {
        logger.verbose(`Skipped calculating sessions as there were no timestamped scores`);
        return [];
    }

    // sort scores ascendingly.
    timestampedScores.sort((a, b) => a.timeAchieved! - b.timeAchieved!);

    // The "Score Groups" for the array of scores provided.
    // This contains scores split on 2hr margins, which allows for more optimised
    // session db requests.
    const sessionScoreGroups: ScoreDocument[][] = [];
    let curGroup: ScoreDocument[] = [];
    let lastTimestamp = 0;

    for (const score of timestampedScores) {
        if (score.timeAchieved! < lastTimestamp + TWO_HOURS) {
            curGroup.push(score);
        } else {
            sessionScoreGroups.push(curGroup);
            curGroup = [score];
        }
        lastTimestamp = score.timeAchieved!;
    }

    // I think this check is redundant?
    if (curGroup.length !== 0) {
        sessionScoreGroups.push(curGroup);
    }

    logger.verbose(`Created ${sessionScoreGroups.length} groups from timestamped scores.`);

    const sessionInfoReturns: SessionInfoReturn[] = [];

    // All async operations inside here *need* to be done in lockstep to avoid colliding sessions.
    // realistically, that shouldn't be possible, but hey.
    /* eslint-disable no-await-in-loop */
    for (const groupScores of sessionScoreGroups) {
        if (groupScores.length === 0) {
            continue;
        }

        const startOfGroup = groupScores[0].timeAchieved!;
        const endOfGroup = groupScores[groupScores.length - 1].timeAchieved!;

        const pbs = await db["score-pbs"].find({
            chartID: { $in: groupScores.map((e) => e.chartID) },
            userID,
        });

        const pbMap: Map<string, PBScoreDocument> = new Map();
        for (const pb of pbs) {
            pbMap.set(pb.chartID, pb);
        }

        const groupInfo = groupScores.map((e) =>
            ProcessScoreIntoSessionScoreInfo(e, pbMap.get(e.chartID))
        );

        // Find any sessions with +/-2hrs of this group. This is rather exhaustive, and could result in some issues
        // if this query returns more than one session. We should account for that by smushing sessions together.
        // As of now, we dont currently do it. @TODO.
        const nearbySession = await db.sessions.findOne({
            userID,
            game,
            playtype,
            $or: [
                { timeStarted: { $gte: startOfGroup - TWO_HOURS, $lt: endOfGroup + TWO_HOURS } },
                { timeEnded: { $gte: startOfGroup - TWO_HOURS, $lt: endOfGroup + TWO_HOURS } },
            ],
        });

        let infoReturn: SessionInfoReturn;

        if (nearbySession) {
            logger.verbose(
                `Found nearby session for ${userID} (${game} ${playtype}) around ${startOfGroup} ${endOfGroup}.`
            );

            const oldScores = await GetScoresFromSession(nearbySession);

            const session = UpdateExistingSession(nearbySession, groupInfo, oldScores, groupScores);

            infoReturn = { sessionID: session.sessionID, type: "Appended" };

            await db.sessions.update(
                {
                    _id: session._id,
                },
                {
                    $set: session,
                }
            );
        } else {
            logger.debug(
                `Creating new session for ${userID} (${game} ${playtype}) around ${startOfGroup} ${endOfGroup}.`
            );

            const session = CreateSession(
                userID,
                importType,
                groupInfo,
                groupScores,
                game,
                playtype
            );

            infoReturn = { sessionID: session.sessionID, type: "Created" };
            await db.sessions.insert(session);
        }

        sessionInfoReturns.push(infoReturn);
    }
    /* eslint-enable no-await-in-loop */

    return sessionInfoReturns;
}
