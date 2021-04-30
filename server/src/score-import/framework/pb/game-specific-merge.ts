import { PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import db from "../../../db/db";
import { KtLogger } from "../../../types";

export async function IIDXMergeFn(
    pbDoc: PBScoreDocument<"iidx:SP" | "iidx:DP">,
    scorePB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    lampPB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    logger: KtLogger
): Promise<boolean> {
    // bad+poor PB document. This is a weird, third indepdenent metric that IIDX players sometimes care about.
    let bpPB = (await db.scores.findOne(
        {
            userID: scorePB.userID,
            chartID: scorePB.chartID,
            "scoreData.hitMeta.bp": { $exists: true },
        },
        {
            sort: {
                "scoreData.hitMeta.bp": 1, // bp 0 is the best BP, bp 1 is worse, so on
            },
        }
    )) as ScoreDocument<"iidx:SP" | "iidx:DP">;

    if (!bpPB) {
        logger.verbose(
            `Could not find BP PB for ${scorePB.userID} ${scorePB.chartID} in PB joining. User likely has no scores with BP defined.`,
            { pbDoc }
        );
        // this isn't actually an error! we just don't have to do anything.
        return true;
    }

    // by default scorePB is chosen for hitMeta fields, so, we can skip any assignments here by returning here.
    if (bpPB.scoreID === scorePB.scoreID) {
        logger.debug(`Skipped merging BP PB as scorePB was also BP PB.`);
        return true;
    } else if (bpPB.scoreID === lampPB.scoreID) {
        pbDoc.scoreData.hitMeta.bp = lampPB.scoreData.hitMeta.bp;
        logger.debug(`Skipped adding BP PB as composedFrom because lampPB was also BP PB.`);
        return true;
    }

    pbDoc.scoreData.hitMeta.bp = bpPB.scoreData.hitMeta.bp;

    pbDoc.composedFrom.other = [{ name: "Best BP", scoreID: bpPB.scoreID }];

    return true;
}
