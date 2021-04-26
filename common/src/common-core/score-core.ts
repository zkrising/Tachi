import { ScoreDocument } from "..";
import { ICollection } from "monk";

export async function AutoCoerce(
    collection: ICollection<ScoreDocument>,
    scores: ScoreDocument[]
): Promise<ScoreDocument[]> {
    let notPBsArr = [];

    for (const s of scores) {
        if (!s.isLampPB) {
            notPBsArr.push({
                userID: s.userID,
                chartID: s.chartID,
                isLampPB: true,
            });
        }
    }

    if (notPBsArr.length === 0) {
        return scores;
    }

    let lampPBsArr = await collection.find({
        $or: notPBsArr,
    });

    let lampPBs: Map<string, ScoreDocument> = new Map();
    for (const score of lampPBsArr) {
        lampPBs.set(`${score.userID}-${score.chartID}`, score);
    }

    for (const score of scores) {
        if (!score.isLampPB) {
            let lampPB = lampPBs.get(`${score.userID}-${score.chartID}`);

            if (lampPB) {
                score.scoreData.lamp = lampPB.scoreData.lamp;
                score.scoreData.lampIndex = lampPB.scoreData.lampIndex;
                score.calculatedData.lampRating = lampPB.calculatedData.lampRating;

                // not too happy about this, this is a sign
                // of something not properly being generalised.
                if (score.game === "bms") {
                    score.calculatedData.rating = lampPB.calculatedData.rating;
                }
                score.isLampPB = true;
            }
        }
    }

    return scores;
}
