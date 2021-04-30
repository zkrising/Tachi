import db from "../../../db/db";
import { integer, ScoreDocument, PBScoreDocument } from "kamaitachi-common";

import { KtLogger } from "../../../types";
import { IIDXMergeFn } from "./game-specific-merge";

export async function CreatePBDoc(userID: integer, chartID: string, logger: KtLogger) {
    let scorePB = await db.scores.findOne(
        {
            userID,
            chartID,
        },
        {
            sort: {
                "scoreData.percent": -1,
            },
        }
    );

    if (!scorePB) {
        logger.severe(`User has no scores on chart, but a PB was attempted to be created?`, {
            chartID,
            userID,
        });
        return; // ??
    }

    let lampPB = (await db.scores.findOne(
        {
            userID,
            chartID,
        },
        {
            sort: {
                "scoreData.lampIndex": -1,
            },
        }
    )) as ScoreDocument; // guaranteed to not be null, as this always resolves
    // to atleast one score (and we got ScorePB above, so we know there's
    // atleast one).

    const pbDoc = await MergeScoreLampIntoPB(userID, scorePB, lampPB, logger);

    if (!pbDoc) {
        return;
    }

    return pbDoc;
}

export async function GetRankingInfo(
    chartID: string,
    userID: integer,
    percent: number
): Promise<{ outOf: number; ranking: number }> {
    let res = await db["score-pbs"].aggregate([
        // exclude the requesting user because we cannot know whether they already have a pb on this chart
        // or not - this means we can exec the same logic regardless of whether they already have a pb or not.
        { $match: { chartID, userID: { $ne: userID } } },
        {
            $group: {
                _id: null,
                outOf: { $sum: 1 },
                ranking: { $sum: { $cond: [{ $gte: ["$scoreData.percent", percent] }, 1, 0] } },
            },
        },
        // { $project: { outOf: 1, ranking: 1 } },
    ]);

    if (!res[0]) {
        return { outOf: 1, ranking: 1 };
    }

    let { outOf, ranking } = res[0];

    // add one to both stats to account for not including the requesting user
    // if the field is undefined, there's no other scores to compare to.
    outOf++;
    ranking++;

    return { outOf, ranking };
}

// Explicit acknowledgement that typing this properly simply takes too much time
// This is a function that is aptly described below when you see how its called.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME_SPECIFIC_MERGE_FNS: Record<string, any> = {
    iidx: IIDXMergeFn,
};

async function MergeScoreLampIntoPB(
    userID: integer,
    scorePB: ScoreDocument,
    lampPB: ScoreDocument,
    logger: KtLogger
): Promise<PBScoreDocument | void> {
    let { outOf, ranking } = await GetRankingInfo(
        scorePB.chartID,
        userID,
        scorePB.scoreData.percent
    );

    const pbDoc: PBScoreDocument = {
        composedFrom: {
            scorePB: scorePB.scoreID,
            lampPB: lampPB.scoreID,
        },
        chartID: scorePB.chartID,
        comments: [scorePB.comment, lampPB.comment].filter((e) => e !== null) as string[],
        userID: scorePB.userID,
        songID: scorePB.songID,
        outOf,
        ranking,
        highlight: scorePB.highlight || lampPB.highlight,
        game: scorePB.game,
        playtype: scorePB.playtype,
        scoreData: {
            score: scorePB.scoreData.score,
            percent: scorePB.scoreData.percent,
            esd: scorePB.scoreData.esd,
            grade: scorePB.scoreData.grade,
            gradeIndex: scorePB.scoreData.gradeIndex,
            lamp: lampPB.scoreData.lamp,
            lampIndex: lampPB.scoreData.lampIndex,
            hitData: scorePB.scoreData.hitData,
            hitMeta: scorePB.scoreData.hitMeta, // this will probably be overrode by game-specific fns
        },
        calculatedData: {
            rating: scorePB.calculatedData.rating,
            lampRating: lampPB.calculatedData.lampRating,
            gameSpecific: scorePB.calculatedData.gameSpecific,
        },
    };

    let GameSpecificMergeFn = GAME_SPECIFIC_MERGE_FNS[scorePB.game];
    if (GameSpecificMergeFn) {
        let success = await GameSpecificMergeFn(pbDoc, scorePB, lampPB, logger);

        // If the mergeFn returns false, this means something has gone
        // rather wrong. We just return undefined here, which in turn
        // tells our calling code to skip this PB. This typically results in a
        // severe-level warning
        if (success === false) {
            return;
        }
    }

    return pbDoc;
}
