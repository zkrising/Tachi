import {
    config,
    Game,
    Grades,
    IDStrings,
    AnyChartDocument,
    ChartDocument,
    GameToIDStrings,
    ESDCore,
    Playtypes,
} from "kamaitachi-common";
import { judgementWindows, gamePercentMax } from "kamaitachi-common/js/config";
import CreateLogCtx from "../../../../logger/logger";
import { InternalFailure, InvalidScoreFailure } from "./converter-failures";

const logger = CreateLogCtx(__filename);

/**
 * Util for getting a games' grade for a given percent.
 */
export function GetGradeFromPercent<I extends IDStrings = IDStrings>(
    game: Game,
    percent: number
): Grades[I] {
    // @todo #102 update config to use game->pt
    const boundaries = config.gradeBoundaries[game];
    const grades = config.grades[game];

    // eslint doesn't like backwards for loops (hey, this for loop is backwards!)
    for (let i = boundaries.length; i >= 0; i--) {
        if (percent >= boundaries[i]) {
            return grades[i] as Grades[I];
        }
    }

    logger.error(`Could not resolve grade for percent ${percent} on game ${game}`);
    throw new InternalFailure(`Could not resolve grade for percent ${percent} on game ${game}`);
}

/**
 * A Generic function for calculating a percent from a given score on
 * a given game.
 */
export function GenericCalculatePercent(
    game: Game,
    score: number,
    chart?: AnyChartDocument
): number {
    switch (game) {
        case "ddr":
        case "museca":
        case "jubeat":
        case "chunithm":
            return (score / 1_000_000) * 100;
        case "sdvx":
        case "usc":
            return (score / 10_000_000) * 100;
        case "popn":
            return (score / 100_000) * 100;
        case "gitadora":
        case "maimai":
            return score;
        case "bms":
        case "iidx":
            if (!chart) {
                logger.severe("No Chart passed to GenericCalcPercent but game was iidx/bms.");
                throw new InternalFailure(
                    "No Chart passed to GenericCalcPercent but game was iidx/bms."
                );
            }

            // Yeah, we declare it like this so the below return is actually clear.
            // eslint-disable-next-line no-case-declarations
            const MAX =
                (chart as ChartDocument<"iidx:SP" | "bms:7K" | "bms:14K" | "iidx:DP">).data
                    .notecount * 2;

            return (100 * score) / MAX;
        default:
            logger.severe(`Invalid game passed of ${game} to GenericCalcPercent.`);
            throw new InternalFailure(`Invalid game passed of ${game} to GenericCalcPercent.`);
    }
}

/**
 * Helper utility for validating percents on a game. This throws an InvalidScoreFailure if the percent is
 * invalid, and returns void on success.
 *
 * This exists to support maimai, as it has a dynamic "max percent".
 */
export function ValidatePercent(game: Game, percent: number, chart: AnyChartDocument) {
    // i love needing a helper function for *ONE* game.
    if (game === "maimai") {
        const mmChart = chart as ChartDocument<"maimai:Single">;
        if (percent > mmChart.data.maxPercent) {
            throw new InvalidScoreFailure(
                `Invalid percent - expected less than ${mmChart.data.maxPercent}.`
            );
        }
    }

    if (percent > gamePercentMax[game]) {
        throw new InvalidScoreFailure(
            `Invalid percent of ${percent} - expected a value less than ${gamePercentMax[game]}% (${chart.songID} ${chart.playtype} ${chart.difficulty}).`
        );
    }
}

/**
 * Generically gets the grade and percent for a given score on a given game. This only works for games where
 * grades are just percent boundaries. This will throw an InvalidScoreFailure if the percent is invalid,
 * or if the grade is invalid.
 */
export function GenericGetGradeAndPercent<G extends Game>(
    game: G,
    score: number,
    chart: AnyChartDocument
) {
    const percent = GenericCalculatePercent(game, score, chart);

    ValidatePercent(game, percent, chart);

    const grade = GetGradeFromPercent(game, percent) as Grades[GameToIDStrings[G]];

    return { percent, grade };
}

/**
 * Calculates the ESD for a given game + percent combo. This function returns
 * null if the game does not support support ESD.
 */
export function CalculateESDForGame(
    game: Game,
    playtype: Playtypes[Game],
    percent: number
): number | null {
    if (
        Object.prototype.hasOwnProperty.call(judgementWindows, game) &&
        // @ts-expect-error i know better
        Object.prototype.hasOwnProperty.call(judgementWindows[game], playtype)
    ) {
        if (percent > 0.1) {
            // @ts-expect-error i know better
            return ESDCore.CalculateESD(judgementWindows[game][playtype], percent);
        } else {
            return 200;
        }
    }

    return null;
}

/**
 * Parses and validates a date from a string.
 * @returns Miliseconds from the unix epoch, or null if the initial argument was null or undefined.
 */
export function ParseDateFromString(str: string | undefined | null): number | null {
    if (!str) {
        return null;
    }

    const date = Date.parse(str);

    if (Number.isNaN(date)) {
        throw new InvalidScoreFailure(`Invalid/Unparsable score timestamp of ${str}.`);
    }

    return date;
}
