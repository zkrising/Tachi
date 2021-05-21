import { integer, PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import CreateLogCtx from "../../../common/logger";
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
    gameflags: integer;
    gauge: number;
    timestamp: integer;
    crit: integer;
    near: integer;
    error: integer;
    options: {
        gaugeType: integer;
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
            `User ${ktchiScore.userID} from PB on chart ${ktchiScore.chartID} has no user document?`
        );
    }

    return {
        score: ktchiScore.scoreData.score,
        timestamp: Math.floor((ktchiScore.timeAchieved ?? 0) / 1000),
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
