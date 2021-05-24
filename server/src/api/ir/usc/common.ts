import {
    integer,
    PBScoreDocument,
    ScoreDocument,
    ChartDocument,
    ImportDocument,
    PublicUserDocument,
} from "kamaitachi-common";
import CreateLogCtx from "../../../common/logger";
import { GetPBOnChart, GetServerRecordOnChart } from "../../../common/scores";
import { MStoS } from "../../../common/util";
import { USCIR_ADJACENT_SCORE_N } from "../../../constants/usc-ir";
import db from "../../../db/db";

const logger = CreateLogCtx("ir/usc/common.ts");

export interface USCServerScore {
    score: integer;
    lamp: 0 | 1 | 2 | 3 | 4 | 5;
    timestamp: integer;
    crit: integer;
    near: integer;
    error: integer;
    ranking: integer;
    gaugeMod: "NORMAL" | "HARD";
    noteMod: "NORMAL" | "MIRROR" | "RANDOM" | "MIR-RAN";
    username: string;
}

export interface USCClientScore {
    score: integer;
    gauge: number;
    timestamp: integer;
    crit: integer;
    near: integer;
    error: integer;
    options: {
        gaugeType: 0 | 1;
        gaugeOpt: integer;
        mirror: boolean;
        random: boolean;
        autoFlags: integer; //???
    };
    windows: {
        perfect: number;
        good: number;
        hold: number;
        miss: number;
        slam: number;
    };
}

export interface USCClientChart {
    chartHash: string;
    artist: string;
    title: string;
    level: integer;
    difficulty: 0 | 1 | 2 | 3;
    effector: string;
    illustrator: string;
    bpm: string;
}

export const KT_LAMP_TO_USC: Record<
    PBScoreDocument<"usc:Single">["scoreData"]["lamp"],
    USCServerScore["lamp"]
> = {
    // we don't do NO PLAY, so its not handled.
    FAILED: 1,
    CLEAR: 2,
    "EXCESSIVE CLEAR": 3,
    "ULTIMATE CHAIN": 4,
    "PERFECT ULTIMATE CHAIN": 5,
};

/**
 * Converts a Kamaitachi Score to the ServerScoreDocument
 * as specified in the USCIR spec. This function silently
 * returns sentinel values in the case that certain
 * fields are null.
 */
export async function KtchiScoreToServerScore(
    ktchiScore: PBScoreDocument<"usc:Single">
): Promise<USCServerScore> {
    // @optimisable
    // Repeated calls to this may pre-emptively provide usernames
    // and score PBs.
    const userDoc = await db.users.findOne(
        {
            id: ktchiScore.userID,
        },
        {
            projection: {
                username: 1,
            },
        }
    );

    if (!userDoc) {
        logger.severe(
            `User ${ktchiScore.userID} from PB on chart ${ktchiScore.chartID} has no user document?`
        );
        throw new Error(
            `User ${ktchiScore.userID} from PB on chart ${ktchiScore.chartID} has no user document?`
        );
    }

    const scorePB = (await db.scores.findOne({
        scoreID: ktchiScore.composedFrom.scorePB,
    })) as ScoreDocument<"usc:Single"> | null;

    if (!scorePB) {
        logger.severe(
            `Score ${ktchiScore.composedFrom.scorePB} does not exist, but is referenced in ${ktchiScore.userID}'s PBDoc on ${ktchiScore.chartID}?`
        );

        throw new Error(
            `Score ${ktchiScore.composedFrom.scorePB} does not exist, but is referenced in ${ktchiScore.userID}'s PBDoc on ${ktchiScore.chartID}?`
        );
    }

    return {
        score: ktchiScore.scoreData.score,
        timestamp: MStoS(ktchiScore.timeAchieved ?? 0),
        crit: ktchiScore.scoreData.hitData.critical ?? 0,
        near: ktchiScore.scoreData.hitData.near ?? 0,
        error: ktchiScore.scoreData.hitData.miss ?? 0,
        ranking: ktchiScore.rankingData.rank,
        lamp: KT_LAMP_TO_USC[ktchiScore.scoreData.lamp],
        username: userDoc.username,
        noteMod: scorePB.scoreMeta.noteMod ?? "NORMAL",
        gaugeMod: scorePB.scoreMeta.gaugeMod ?? "NORMAL",
    };
}

export async function CreatePOSTScoresResponseBody(
    userID: integer,
    chartDoc: ChartDocument<"usc:Single">,
    scoreID: string
): Promise<POSTScoresResponseBody> {
    const scorePB = (await GetPBOnChart(
        userID,
        chartDoc.chartID
    )) as PBScoreDocument<"usc:Single"> | null;

    if (!scorePB) {
        logger.severe(`Score was imported for chart, but no ScorePB was available on this chart?`, {
            chartDoc,
            scoreID,
        });
        throw new Error(
            `Score was imported for chart, but no ScorePB was available on this chart?`
        );
    }

    const ktServerRecord = (await GetServerRecordOnChart(
        chartDoc.chartID
    )) as PBScoreDocument<"usc:Single"> | null;

    // this is impossible to trigger without making a race-condition.
    /* istanbul ignore next */
    if (!ktServerRecord) {
        logger.severe(
            `Score was imported for chart, but no Server Record was available on this chart?`,
            {
                chartDoc,
                scoreID,
            }
        );
        throw new Error(
            `Score was imported for chart, but no Server Record was available on this chart?`
        );
    }

    const usersRanking = scorePB.rankingData.rank;

    // This returns N scores immediately ranked higher
    // than the current user.

    const adjAbove = (await db["score-pbs"].find(
        {
            chartID: chartDoc.chartID,
            "rankingData.rank": { $lt: usersRanking },
        },
        {
            limit: USCIR_ADJACENT_SCORE_N,
            sort: { "rankingData.rank": -1 },
        }
    )) as PBScoreDocument<"usc:Single">[];

    // The specification enforces that we return them in
    // ascending order, though, so we reverse this after
    // the query.
    adjAbove.reverse();

    // if the users ranking implies that the above query
    // returned the server record (i.e. they are ranked
    // between #1 and #1 + N)
    // delete the server record from adjAbove.
    if (usersRanking - USCIR_ADJACENT_SCORE_N <= 1) {
        adjAbove.shift();
    }

    // Similar to above, this returns the N most immediate
    // scores below the given user.
    const adjBelow = (await db["score-pbs"].find(
        {
            chartID: chartDoc.chartID,
            "rankingData.rank": { $gt: usersRanking },
        },
        {
            limit: USCIR_ADJACENT_SCORE_N,
            sort: { "rankingData.rank": 1 },
        }
    )) as PBScoreDocument<"usc:Single">[];

    const [score, serverRecord, adjacentAbove, adjacentBelow] = await Promise.all([
        KtchiScoreToServerScore(scorePB),
        KtchiScoreToServerScore(ktServerRecord),
        Promise.all(adjAbove.map(KtchiScoreToServerScore)),
        Promise.all(adjBelow.map(KtchiScoreToServerScore)),
    ]);

    const originalScore = (await db.scores.findOne({
        scoreID,
    })) as ScoreDocument<"usc:Single">;

    if (!originalScore) {
        logger.severe(
            `Score with ID ${scoreID} is not in the database, but was claimed to be inserted?`
        );
        throw new Error(
            `Score with ID ${scoreID} is not in the database, but was claimed to be inserted?`
        );
    }

    return {
        score,
        serverRecord,
        isServerRecord: scorePB.userID === ktServerRecord?.userID,
        isPB: scorePB.composedFrom.scorePB === scoreID,
        sendReplay: originalScore.scoreMeta.replayID!,
        adjacentAbove,
        adjacentBelow,
    };
}

export interface POSTScoresResponseBody {
    score: USCServerScore;
    serverRecord: USCServerScore;
    adjacentAbove: USCServerScore[];
    adjacentBelow: USCServerScore[];
    isPB: boolean;
    isServerRecord: boolean;
    sendReplay: string;
}
