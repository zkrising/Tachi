import {
    ChartDocument,
    Game,
    Playtypes,
    ScoreDocument,
    SongDocument,
    TierlistDataDocument,
} from "kamaitachi-common";
import { DryScore, integer } from "../../../../types";
import { CreateGameSpecific } from "./game-specific";
import { CalculateCHUNITHMRating, CalculateGITADORARating } from "./game-specific-stats";

export async function CreateCalculatedData(
    dryScore: DryScore,
    chart: ChartDocument,
    song: SongDocument
): Promise<ScoreDocument["calculatedData"]> {
    const game = dryScore.game;
    const playtype = chart.playtype;

    const [rating, gameSpecific] = await Promise.all([
        CalculateRating(dryScore, game, playtype, chart),
        CreateGameSpecific(game, playtype, chart, dryScore),
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
const OVERRIDE_RATING_FUNCTIONS = {
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
    chart: ChartDocument
) {
    // @todo
    let OverrideFunction: OverrideRatingFunction | undefined =
        // @ts-expect-error I'm too lazy to explain this to TS
        OVERRIDE_RATING_FUNCTIONS[game]?.[playtype];

    if (!OverrideFunction) {
        return 0; // go to default kamaitachi rating fn ?
    }

    return await OverrideFunction(dryScore, chart);
}

async function CalculateLampRating(
    dryScore: DryScore,
    chart: ChartDocument,
    tierlist: TierlistDataDocument
) {}

interface OverrideRatingFunction {
    (dryScore: DryScore, chartData: ChartDocument): number | Promise<number>;
}
