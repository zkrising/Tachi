import { ChartDocument, Game, IIDXBPIData, Playtypes } from "kamaitachi-common";
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
    dryScore: DryScore
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
                BPIData.coef
            );

            gameSpecific.KESDC =
                dryScore.scoreData.esd === null
                    ? null
                    : CalculateKESDC(BPIData.kesd, dryScore.scoreData.esd);
        } else {
            gameSpecific.BPI = null;
            gameSpecific.KESDC = null;
        }

        if (playtype === "SP") {
            gameSpecific["K%"] = await KaidenPercentile(dryScore, chart);
        }
    } else if (game === "sdvx") {
        gameSpecific.VF4 = CalculateVF4(
            dryScore as DryScore<"sdvx", "Single", "sdvx:Single">,
            chart as ChartDocument
        );
        gameSpecific.VF5 = CalculateVF5(
            dryScore as DryScore<"sdvx", "Single", "sdvx:Single">,
            chart as ChartDocument
        );
    } else if (game === "ddr") {
        // either playtype
        gameSpecific.MFCP = CalculateMFCP(dryScore, chart);
    }

    return gameSpecific;
}
