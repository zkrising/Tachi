import { PBScoreDocument, integer, ScoreDocument, ChartDocument } from "tachi-common";
import db from "../../../../../external/mongo/db";
import CreateLogCtx from "../../../../../lib/logger/logger";
import { GetUsernameFromUserID } from "../../../../../utils/user";

const LAMP_TO_BEATORAJA = [0, 1, 3, 4, 5, 6, 7, 8] as const;

const RAN_INDEXES = {
    NONRAN: 0,
    MIRROR: 1,
    RANDOM: 2,
    "R-RANDOM": 3,
    "S-RANDOM": 4,
} as const;

type BeatorajaJudgements = `${"e" | "l"}${"pg" | "gr" | "gd" | "bd" | "pr"}`;

type BeatorajaScoreJudgements = {
    [K in BeatorajaJudgements]: integer;
};

type BeatorajaPartialScoreFormat = {
    sha256: string;
    player: string;
    playcount: integer;
    clear: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    date: number;
    deviceType: string | null;
    gauge: number;
    random: 0 | 1 | 2 | 3 | 4 | null;
    passnotes: integer;
    minbp: integer;
    notes: integer;
    maxcombo: integer | null;
};

export type BeatorajaIRScoreFormat = BeatorajaPartialScoreFormat & BeatorajaScoreJudgements;

const logger = CreateLogCtx(__filename);

/**
 * Converts a Kamaitachi Score PB into the beatoraja IR format.
 * @param pbScore - The PB score to convert.
 * @param chart - The chart document the PB score belongs to.
 * @param requestingUserID - The user who requested this conversion. This is
 * because beatoraja uses the empty string to dictate that the score was from
 * the requesting user.
 */
export async function KtchiPBScoreToBeatorajaFormat(
    pbScore: PBScoreDocument<"bms:7K" | "bms:14K">,
    chart: ChartDocument<"bms:7K" | "bms:14K">,
    requestingUserID: integer
) {
    const playcount = await db.scores.count({ userID: pbScore.userID, chartID: chart.chartID });
    const username =
        pbScore.userID === requestingUserID ? "" : await GetUsernameFromUserID(pbScore.userID);
    const lampPB = (await db.scores.findOne({
        scoreID: pbScore.composedFrom.lampPB,
    })) as ScoreDocument<"bms:7K" | "bms:14K"> | null;

    if (!lampPB) {
        logger.severe(
            `User ${pbScore.userID}'s PB on ${chart.chartID} has no lampPB, but references ${pbScore.composedFrom.lampPB}.`
        );
        throw new Error(
            `User ${pbScore.userID}'s PB on ${chart.chartID} has no lampPB, but references ${pbScore.composedFrom.lampPB}.`
        );
    }

    return KtchiScoreDataToBeatorajaFormat(
        pbScore,
        chart.data.hashSHA256,
        username,
        chart.data.notecount,
        playcount,
        lampPB.scoreMeta.inputDevice,
        lampPB.scoreMeta.random
    );
}

/**
 * Converts various data from Kamaitachi to the beatoraja format.
 * @param pbScore - The users PB Score document for this chart.
 * @param sha256 - The SHA256 for this chart.
 * @param username - The users name. Beatoraja uses the special value "" to indicate the user is the current player.
 * @param notecount - The notecount for this chart.
 * @param playcount - The total times this player has played this chart.
 * @param inputDevice - The input device this user used.
 * @param random - What random modifier was used.
 * @returns A Beatoraja Score Document.
 */
function KtchiScoreDataToBeatorajaFormat(
    pbScore: PBScoreDocument<"bms:7K" | "bms:14K">,
    sha256: string,
    username: string,
    notecount: integer,
    playcount: integer,
    inputDevice: ScoreDocument<"bms:7K" | "bms:14K">["scoreMeta"]["inputDevice"],
    random: ScoreDocument<"bms:7K" | "bms:14K">["scoreMeta"]["random"]
) {
    const scoreData = pbScore.scoreData;

    let rajaRandom = 0 as const;

    // @todo #138 Investigate how beatoraja handles DP randoms - for now, we just skip them.
    if (pbScore.playtype === "7K") {
        if (random) {
            // @ts-expect-error Invalid indexing because playtype removes the random tuple.
            rajaRandom = RAN_INDEXES[random];
        }
    }

    const beatorajaScore: BeatorajaPartialScoreFormat = {
        sha256,
        player: username,
        playcount,
        clear: LAMP_TO_BEATORAJA[scoreData.lampIndex] ?? 0,
        date: pbScore.timeAchieved ?? 0,
        maxcombo: scoreData.hitMeta.maxCombo ?? 0,
        deviceType: inputDevice ?? null,
        gauge: scoreData.hitMeta.gauge ?? 0,
        random: rajaRandom,
        passnotes: scoreData.hitMeta.diedAt ?? notecount,
        minbp: scoreData.hitMeta.bp ?? 0,
        notes: notecount,
    };

    const judgements: Partial<BeatorajaScoreJudgements> = {};

    // Not everything exports these properties. If they're not there, they should default to 0.
    // For cases like LR2/manual - this will just result in a set of 0s.
    for (const key of [
        "epg",
        "lpg",
        "egr",
        "lgr",
        "egd",
        "lgd",
        "ebd",
        "lbd",
        "epr",
        "lpr",
        "ems",
        "lms",
    ] as BeatorajaJudgements[]) {
        judgements[key] = scoreData.hitMeta[key] ?? 0;
    }

    return beatorajaScore;
}
