import { AnyChartDocument, Game, Playtypes, ScoreDocument } from "kamaitachi-common";
import { ratingParameters, lamps, clearLamp } from "kamaitachi-common/js/config";
import { Logger } from "winston";
import {
    GetAllTierlistDataOfType,
    GetDefaultTierlist,
    GetOneTierlistData,
} from "../../../core/tierlist-core";
import { DryScore } from "../../../types";
import { CreateGameSpecific } from "./game-specific";
import { CalculateCHUNITHMRating, CalculateGITADORARating } from "./game-specific-stats";

export async function CreateCalculatedData(
    dryScore: DryScore,
    chart: AnyChartDocument,
    logger: Logger
): Promise<ScoreDocument["calculatedData"]> {
    const game = dryScore.game;
    const playtype = chart.playtype;

    let defaultTierlist = await GetDefaultTierlist(game, playtype);
    let defaultTierlistID = defaultTierlist?.tierlistID; // tierlistID | undefined

    const [rating, lampRating, gameSpecific] = await Promise.all([
        CalculateRating(dryScore, game, playtype, chart, defaultTierlistID),
        CalculateLampRating(dryScore, game, playtype, chart, defaultTierlistID),
        CreateGameSpecific(game, playtype, chart, dryScore, logger),
    ]);

    return {
        rating,
        lampRating,
        gameSpecific,
    };
}

/**
 * Override the default rating function for a game with
 * something else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OVERRIDE_RATING_FUNCTIONS: Partial<Record<Game, any>> = {
    gitadora: {
        Gita: CalculateGITADORARating,
        Dora: CalculateGITADORARating,
    },
    chunithm: {
        Single: CalculateCHUNITHMRating,
    },
};

interface RatingParameters {
    failHarshnessMultiplier: number;
    pivotPercent: number;
    clearExpMultiplier: number;
}

/**
 * Calculates the rating for a score. Listens to the override functions declared above.
 */
async function CalculateRating(
    dryScore: DryScore,
    game: Game,
    playtype: Playtypes[Game],
    chart: AnyChartDocument,
    defaultTierlistID?: string
) {
    // @todo
    let OverrideFunction: OverrideRatingFunction | undefined =
        OVERRIDE_RATING_FUNCTIONS[game]?.[playtype];

    // If this game doesn't have a specific rating function declared, fall back to the default "generic" rating function.
    // This is just a function that is guaranteed to work for all input - and therefore not result in lower-skilled users
    // always seeing 0.
    if (!OverrideFunction) {
        let parameters = ratingParameters[dryScore.game];

        let levelNum = chart.levelNum;

        if (defaultTierlistID) {
            let tierlistData = await GetOneTierlistData(
                game,
                chart,
                "score",
                null,
                defaultTierlistID
            );

            if (tierlistData) {
                levelNum = tierlistData.data.value;
            }
        }

        return RatingCalcV1(dryScore.scoreData.percent, levelNum, parameters);
    }

    return OverrideFunction(dryScore, chart);
}

// Generic Rating Calc that is guaranteed to work for everything. This is unspecialised, and not great.
function RatingCalcV1(percent: number, levelNum: number, parameters: RatingParameters) {
    let percentDiv100 = percent / 100;

    if (percent > parameters.pivotPercent) {
        return RatingCalcV0Fail(percentDiv100, levelNum, parameters);
    }

    return RatingCalcV1Clear(percentDiv100, levelNum, parameters);
}

function RatingCalcV1Clear(percentDiv100: number, levelNum: number, parameters: RatingParameters) {
    // https://www.desmos.com/calculator/hn7uxjmjkc

    let rating =
        Math.cosh(
            parameters.clearExpMultiplier * levelNum * (percentDiv100 - parameters.pivotPercent)
        ) +
        (levelNum - 1);
    if (!isFinite(rating)) {
        return 0;
    } else if (Number.isNaN(rating)) {
        return 0; // safety checks
    } else if (rating > 1000) {
        return 0; // AAAAA JUST STOP THE WEIRD STUFF
    } else {
        return rating;
    }
}

function RatingCalcV0Fail(percentDiv100: number, levelNum: number, parameters: RatingParameters) {
    // https://www.desmos.com/calculator/ngjie5elto
    return (
        percentDiv100 ** (parameters.failHarshnessMultiplier * levelNum) *
        (levelNum / parameters.pivotPercent ** (parameters.failHarshnessMultiplier * levelNum))
    );
}

async function CalculateLampRating(
    dryScore: DryScore,
    game: Game,
    playtype: Playtypes[Game],
    chart: AnyChartDocument,
    defaultTierlistID?: string
) {
    // if no tierlist data
    if (!defaultTierlistID) {
        return LampRatingNoTierlistInfo(dryScore, game, chart);
    }

    let lampTierlistInfo = await GetAllTierlistDataOfType(game, chart, "lamp", defaultTierlistID);

    // if no tierlist info
    if (lampTierlistInfo.length === 0) {
        return LampRatingNoTierlistInfo(dryScore, game, chart);
    }

    let userLampIndex = lamps[game].indexOf(dryScore.scoreData.lamp);

    let lampRating = 0;

    // why is this like this and not a lookup table?
    // Some charts have higher values for *lower* lamps, such as
    // one more lovely in IIDX being harder to NC than it is to HC!
    // this means we have to iterate over all tierlist data, in general.
    for (const tierlistData of lampTierlistInfo) {
        if (
            // this tierlistData has higher value than the current lampRating
            tierlistData.data.value > lampRating &&
            // and your clear is better than the lamp its for
            lamps[game].indexOf(tierlistData.key!) <= userLampIndex
        ) {
            lampRating = tierlistData.data.value;
        }
    }

    return lampRating;
}

function LampRatingNoTierlistInfo(dryScore: DryScore, game: Game, chart: AnyChartDocument) {
    const CLEAR_LAMP_INDEX = lamps[game].indexOf(clearLamp[game]);

    // if this is a clear
    if (lamps[game].indexOf(dryScore.scoreData.lamp) >= CLEAR_LAMP_INDEX) {
        // return this chart's numeric level as the lamp rating
        return chart.levelNum;
    }

    // else, this score is worth 0.
    return 0;
}

interface OverrideRatingFunction {
    (dryScore: DryScore, chartData: AnyChartDocument): number | Promise<number>;
}
