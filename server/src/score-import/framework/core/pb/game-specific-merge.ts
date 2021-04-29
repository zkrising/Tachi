import { PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import db from "../../../../db/db";
import { KtLogger } from "../../../../types";

export async function IIDXMergeFn(
    pbDoc: PBScoreDocument<"iidx:SP" | "iidx:DP">,
    scorePB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    lampPB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    logger: KtLogger
) {
    // bad+poor PB document. This is a weird, third indepdenent metric that IIDX players sometimes care about.
    let bpPB = (await db.scores.findOne(
        {
            userID: scorePB.userID,
            chartID: scorePB.chartID,
        },
        {
            sort: {
                "scoreData.hitMeta.bp": 1, // bp 0 is the best BP, bp 1 is worse, so on
            },
        }
    )) as ScoreDocument<"iidx:SP" | "iidx:DP">;

    if (!bpPB) {
        logger.warn(
            `Could not find BP PB for ${scorePB.userID} ${scorePB.chartID} in PB joining.`,
            { pbDoc }
        );
        return;
    }

    // by default scorePB is chosen for hitMeta fields, so, we can skip any assignments here by returning here.
    if (bpPB.scoreID === scorePB.scoreID) {
        logger.debug(`Skipped merging BP PB as scorePB was also BP PB.`);
        return;
    } else if (bpPB.scoreID === lampPB.scoreID) {
        pbDoc.scoreData.hitMeta.bp = lampPB.scoreData.hitMeta.bp;
        // dfgmdfgfgdgf
        logger.verbose(`Skipped adding BP PB as composedFrom because lampPB was also BP PB.`);
        return;
    }

    pbDoc.scoreData.hitMeta.bp = bpPB.scoreData.hitMeta.bp;

    pbDoc.composedFrom.other = [{ name: "Best BP", scoreID: bpPB.scoreID }];

    return;
}
