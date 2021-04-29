import db from "../../../../db/db";
import { integer, ScoreDocument, PBScoreDocument } from "kamaitachi-common";

import { KtLogger } from "../../../../types";
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
        logger.warn(`User has no scores on chart, but a PB was attempted to be created?`, {
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
    )) as ScoreDocument; // guaranteed to not be null, but...

    const pbDoc = await MergeScoreLampIntoPB(userID, scorePB, lampPB);

    return pbDoc;
}

export async function GetRankingInfo(
    chartID: string,
    userID: integer,
    percent: number
): Promise<{ outOf: number; ranking: number }> {
    let { outOf, ranking } = await db["score-pbs"].aggregate([
        // exclude the requesting user because we cannot know whether they already have a pb on this chart
        // or not - this means we can exec the same logic regardless of whether they already have a pb or not.
        { $match: { chartID, userID: { $ne: userID } } },
        {
            $group: {
                _id: null,
                outOf: { $sum: 1 },
                ranking: { $sum: { $gte: ["$scoreData.percent", percent] } },
            },
        },
        { $project: { outOf: 1, ranking: 1 } },
    ]);

    // add one to both stats to account for not including the requesting user
    // if the field is undefined, there's no other scores to compare to.
    outOf = outOf ? outOf++ : 1;
    ranking = ranking ? ranking++ : 1;

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
    lampPB: ScoreDocument
): Promise<PBScoreDocument> {
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
        await GameSpecificMergeFn(pbDoc, scorePB, lampPB);
    }

    return pbDoc;
}
