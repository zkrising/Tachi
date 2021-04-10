import { ChartDocument, Game, Playtypes } from "kamaitachi-common";
import { Logger } from "winston";
import db from "../../../../db";
import { DryScore } from "../../../../types";
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
    chart: ChartDocument,
    dryScore: DryScore,
    logger: Logger
): Promise<Record<string, number | null>> {
    let gameSpecific: Record<string, number | null> = {};

    if (game === "iidx") {
        let BPIData = await db["iidx-bpi-data"].findOne({
            chartID: chart.chartID,
        });

        if (BPIData) {
            gameSpecific.BPI = CalculateBPI(
                BPIData.kavg,
                BPIData.wr,
                dryScore.scoreData.score,
                chart.notedata.notecount * 2,
                BPIData.coef,
                logger
            );

            gameSpecific.KESDC =
                dryScore.scoreData.esd === null
                    ? null
                    : CalculateKESDC(BPIData.kesd, dryScore.scoreData.esd, logger);
        } else {
            gameSpecific.BPI = null;
            gameSpecific.KESDC = null;
        }

        if (playtype === "SP") {
            gameSpecific["K%"] = await KaidenPercentile(dryScore, chart, logger);
        }
    } else if (game === "sdvx") {
        gameSpecific.VF4 = CalculateVF4(
            dryScore as DryScore<"sdvx", "Single", "sdvx:Single">,
            chart as ChartDocument,
            logger
        );
        gameSpecific.VF5 = CalculateVF5(
            dryScore as DryScore<"sdvx", "Single", "sdvx:Single">,
            chart as ChartDocument,
            logger
        );
    } else if (game === "ddr") {
        // either playtype
        gameSpecific.MFCP = CalculateMFCP(dryScore, chart, logger);
    }

    return gameSpecific;
}
