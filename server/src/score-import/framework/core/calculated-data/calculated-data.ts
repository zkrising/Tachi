import {
    AnyChartDocument,
    ChartDocument,
    Game,
    IDStrings,
    Playtypes,
    ScoreDocument,
    TierlistDataDocument,
} from "kamaitachi-common";
import { Logger } from "winston";
import { DryScore } from "../../../../types";
import { CreateGameSpecific } from "./game-specific";
import { CalculateCHUNITHMRating, CalculateGITADORARating } from "./game-specific-stats";

export async function CreateCalculatedData(
    dryScore: DryScore,
    chart: AnyChartDocument,
    logger: Logger
): Promise<ScoreDocument["calculatedData"]> {
    const game = dryScore.game;
    const playtype = chart.playtype;

    const [rating, gameSpecific] = await Promise.all([
        CalculateRating(dryScore, game, playtype, chart),
        CreateGameSpecific(game, playtype, chart, dryScore, logger),
    ]);

    return {
        rating,
        lampRating: 0,
        ranking: null,
        outOf: null,
        gameSpecific,
    };
}

/**
 * Override the default rating function for a game with
 * something else.
 */
const OVERRIDE_RATING_FUNCTIONS: Partial<Record<Game, any>> = {
    gitadora: {
        Gita: CalculateGITADORARating,
        Dora: CalculateGITADORARating,
    },
    chunithm: {
        Single: CalculateCHUNITHMRating,
    },
};

/**
 * Calculates the rating for a score. Listens to the override functions declared above.
 */
async function CalculateRating<G extends Game>(
    dryScore: DryScore,
    game: G,
    playtype: Playtypes[G],
    chart: AnyChartDocument
) {
    // @todo
    let OverrideFunction: OverrideRatingFunction | undefined =
        OVERRIDE_RATING_FUNCTIONS[game]?.[playtype];

    if (!OverrideFunction) {
        return 0; // go to default kamaitachi rating fn ?
    }

    return await OverrideFunction(dryScore, chart);
}

// stub
// async function CalculateLampRating(
//     dryScore: DryScore,
//     chart: ChartDocument,
//     tierlist: TierlistDataDocument
// ) {
//     return 0;
// }

interface OverrideRatingFunction {
    (dryScore: DryScore, chartData: AnyChartDocument): number | Promise<number>;
}
