import { ChartDocument, PBScoreDocument } from "tachi-common";
import { Router, RequestHandler } from "express";
import db from "../../../../../external/mongo/db";
import { SYMBOL_KtchiData } from "../../../../../lib/constants/ktchi";
import { KtchiPBScoreToBeatorajaFormat } from "./convert-scores";
import { AssignToReqKtchiData } from "../../../../../utils/req-ktchi-data";

const router: Router = Router({ mergeParams: true });

const GetChartDocument: RequestHandler = async (req, res, next) => {
    const chart = (await db.charts.bms.findOne({
        "data.hashSHA256": req.params.chartSHA256,
    })) as ChartDocument<"bms:7K" | "bms:14K"> | null;

    if (!chart) {
        return res.status(404).json({
            success: false,
            description: `Chart does not exist on IR yet.`,
        });
    }

    AssignToReqKtchiData(req, { beatorajaChartDoc: chart });

    return next();
};

router.use(GetChartDocument);

/**
 * Retrieves scores for the given chart.
 * @name GET /ir/beatoraja/chart/:chartSHA256/scores
 */
router.get("/scores", async (req, res) => {
    const chart = req[SYMBOL_KtchiData]!.beatorajaChartDoc!;

    const scores = (await db["score-pbs"].find({
        chartID: chart.chartID,
    })) as PBScoreDocument<"bms:7K" | "bms:14K">[];

    // @todo #139 Optimise GET /ir/beatoraja/chart/:chartSHA256/scores
    // @optimisable - This should be solved with a couple queries and a hashmap.
    const beatorajaScores = await Promise.all(
        scores.map((e) =>
            KtchiPBScoreToBeatorajaFormat(e, chart, req[SYMBOL_KtchiData]!.beatorajaAuthDoc!.userID)
        )
    );

    return res.status(200).json({
        success: true,
        description: `Successfully returned ${beatorajaScores.length}`,
        body: beatorajaScores,
    });
});

export default router;
