import { AnyChartDocument, ChartDocument, Game, Playtypes, Grades, Lamps } from "kamaitachi-common";
import db from "../../../external/mongo/db";
import { KtLogger } from "../../../types";
import { DryScore } from "../common/types";
import {
    CalculateBPI,
    CalculateKESDC,
    CalculateMFCP,
    CalculateVF4,
    CalculateVF5,
    KaidenPercentile,
} from "./game-specific-stats";

// Creates Game-Specific calculatedData for the provided game & playtype.
export async function CreateGameSpecific<G extends Game>(
    game: G,
    playtype: Playtypes[G],
    chart: AnyChartDocument,
    dryScore: DryScore,
    // ESD gets specially passed through because it's not part of the DryScore, but
    // can be used for statistics anyway.
    esd: number | null,
    logger: KtLogger
): Promise<Record<string, number | null>> {
    const gameSpecific: Record<string, number | null> = {};

    if (game === "iidx") {
        const BPIData = await db["iidx-bpi-data"].findOne({
            chartID: chart.chartID,
        });

        if (BPIData) {
            gameSpecific.BPI = CalculateBPI(
                BPIData.kavg,
                BPIData.wr,
                dryScore.scoreData.score,
                (chart as ChartDocument<"iidx:DP" | "iidx:SP">).data.notecount * 2,
                BPIData.coef
            );

            gameSpecific.KESDC = esd === null ? null : CalculateKESDC(BPIData.kesd, esd);
        } else {
            gameSpecific.BPI = null;
            gameSpecific.KESDC = null;
        }

        if (playtype === "SP") {
            gameSpecific["K%"] = await KaidenPercentile(dryScore, chart);
        }
    } else if (game === "sdvx") {
        gameSpecific.VF4 = CalculateVF4(
            dryScore.scoreData.grade as Grades["sdvx:Single"],
            dryScore.scoreData.percent,
            chart,
            logger
        );
        gameSpecific.VF5 = CalculateVF5(
            dryScore.scoreData.grade as Grades["sdvx:Single"],
            dryScore.scoreData.lamp as Lamps["sdvx:Single"],
            dryScore.scoreData.percent,
            chart,
            logger
        );
    } else if (game === "ddr") {
        // either playtype
        gameSpecific.MFCP = CalculateMFCP(dryScore, chart, logger);
    }

    return gameSpecific;
}
