import { PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import { FindChartWithChartID } from "../../../utils/database-lookup/chart";
import db from "../../../external/mongo/db";
import { KtLogger } from "../../../utils/types";
import { CalculateVF4, CalculateVF5 } from "../calculated-data/game-specific-stats";
import { InternalFailure } from "../common/converter-failures";

export async function IIDXMergeFn(
    pbDoc: PBScoreDocument<"iidx:SP" | "iidx:DP">,
    scorePB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    lampPB: ScoreDocument<"iidx:SP" | "iidx:DP">,
    logger: KtLogger
): Promise<boolean> {
    // bad+poor PB document. This is a weird, third indepdenent metric that IIDX players sometimes care about.
    const bpPB = (await db.scores.findOne(
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

    // Update lamp related iidx-specific info from the lampPB.
    pbDoc.scoreData.hitMeta.gsm = lampPB.scoreData.hitMeta.gsm ?? null;
    pbDoc.scoreData.hitMeta.gauge = lampPB.scoreData.hitMeta.gauge ?? null;
    pbDoc.scoreData.hitMeta.gaugeHistory = lampPB.scoreData.hitMeta.gaugeHistory ?? null;

    return true;
}

/**
 * This function recalculates and applies VF4 and VF5 to the PB document.
 *
 * SDVX cannot just select the larger volforce - instead, volforce has to be
 * re-calculated for any different permutation of scorePB + lampPB.
 */
export async function SDVXMergeFn(
    pbDoc: PBScoreDocument<"sdvx:Single">,
    scorePB: ScoreDocument<"sdvx:Single">,
    lampPB: ScoreDocument<"sdvx:Single">,
    logger: KtLogger
): Promise<boolean> {
    // @optimisable
    // This is a re-fetch, but it's difficult to pass the chart all
    // the way down here due to how chartIDs (set) works. :(
    const chart = await FindChartWithChartID("sdvx", pbDoc.chartID);

    if (!chart) {
        logger.severe(`Chart ${pbDoc.chartID} disappeared underfoot?`);
        throw new InternalFailure(`Chart ${pbDoc.chartID} disappeared underfoot?`);
    }

    pbDoc.calculatedData.gameSpecific.VF4 = CalculateVF4(
        pbDoc.scoreData.grade,
        pbDoc.scoreData.percent,
        chart,
        logger
    );

    pbDoc.calculatedData.gameSpecific.VF4 = CalculateVF5(
        pbDoc.scoreData.grade,
        pbDoc.scoreData.lamp,
        pbDoc.scoreData.percent,
        chart,
        logger
    );

    return true;
}
