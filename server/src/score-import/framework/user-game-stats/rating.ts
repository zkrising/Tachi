import { Game, Playtypes, integer, GameSpecificCalcLookup, IDStrings } from "kamaitachi-common";
import db from "../../../external/mongo/db";
import { KtLogger } from "../../../utils/types";

export async function CalculateRatings(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    logger: KtLogger
): Promise<{ rating: number; lampRating: number }> {
    const SCORE_COUNT = 20;
    const [bestRating, bestLampRating] = await Promise.all([
        db["score-pbs"].find(
            {
                game,
                playtype,
                userID,
                isPrimary: true,
            },
            {
                sort: {
                    "calculatedData.rating": -1,
                },
                limit: SCORE_COUNT,
            }
        ),
        db["score-pbs"].find(
            {
                game,
                playtype,
                userID,
                isPrimary: true,
            },
            {
                sort: {
                    "calculatedData.lampRating": -1,
                },
                limit: SCORE_COUNT,
            }
        ),
    ]);

    logger.debug(
        `Found ${bestRating.length} best rating scores and ${bestLampRating.length} bestLampRating scores.`
    );

    const rating = bestRating.reduce((a, r) => a + r.calculatedData.rating, 0) / SCORE_COUNT;
    const lampRating =
        bestLampRating.reduce((a, r) => a + r.calculatedData.lampRating, 0) / SCORE_COUNT;

    return { rating, lampRating };
}

type CustomCalcNames = GameSpecificCalcLookup[IDStrings];

function LazySumAll(key: CustomCalcNames) {
    return async (game: Game, playtype: Playtypes[Game], userID: integer) => {
        const sc = await db["score-pbs"].find({
            game: game,
            playtype: playtype,
            userID: userID,
            isPrimary: true,
            [`calculatedData.gameSpecific.${key}`]: { $gt: 0 },
        });

        const result = sc.reduce((a, b) => a + b.calculatedData.gameSpecific[key]!, 0);

        return result;
    };
}

function LazyCalcN(key: CustomCalcNames, n: integer, returnMean?: boolean) {
    return async (game: Game, playtype: Playtypes[Game], userID: integer) => {
        const sc = await db["score-pbs"].find(
            {
                game: game,
                playtype: playtype,
                userID: userID,
                isPrimary: true,
                [`calculatedData.gameSpecific.${key}`]: { $gt: 0 },
            },
            {
                limit: n,
                sort: { [`calculatedData.gameSpecific.${key}`]: -1 },
            }
        );

        let result = sc.reduce((a, b) => a + b.calculatedData.gameSpecific[key]!, 0);

        if (returnMean) {
            result = result / n;
        }

        return result;
    };
}

const LazySumN = (key: CustomCalcNames, n: integer) => LazyCalcN(key, n, false);
const LazyMeanN = (key: CustomCalcNames, n: integer) => LazyCalcN(key, n, true);

const CUSTOM_RATING_FUNCTIONS = {
    iidx: {
        SP: {
            BPI: LazyMeanN("BPI", 20),
            // "K%": LazyMeanN("K%", 100), useless
        },
        DP: {
            BPI: LazyMeanN("BPI", 20),
        },
    },
    sdvx: {
        Single: {
            VF4: LazySumN("VF4", 20),
            VF5: LazySumN("VF5", 50),
        },
    },
    usc: {
        Single: {
            VF4: LazySumN("VF4", 20),
            VF5: LazySumN("VF5", 50),
        },
    },
    ddr: {
        SP: {
            MFCP: LazySumAll("MFCP"),
        },
        DP: {
            MFCP: LazySumAll("MFCP"),
        },
    },
    gitadora: {
        Gita: { skill: CalculateGitadoraSkill },
        Dora: { skill: CalculateGitadoraSkill },
    },
};

async function CalculateGitadoraSkill(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    logger: KtLogger
) {
    const hotCharts = await db.charts.gitadora.find(
        { "flags.HOT N-1": true },
        { projection: { chartID: 1 } }
    );

    const hotChartIDs = hotCharts.map((e) => e.chartID);

    const [bestHotScores, bestScores] = await Promise.all([
        db["score-pbs"].find(
            { userID, chartID: { $in: hotChartIDs } },
            {
                sort: { "calculatedData.rating": -1 },
                limit: 25,
                projection: { "calculatedData.rating": 1 },
            }
        ),
        // @optimisable
        // $nin is VERY expensive, there might be a better way to do this.
        db["score-pbs"].find(
            { userID, chartID: { $nin: hotChartIDs } },
            {
                sort: { "calculatedData.rating": -1 },
                limit: 25,
                projection: { "calculatedData.rating": 1 },
            }
        ),
    ]);

    let skill = 0;
    skill += bestHotScores.reduce((a, r) => a + r.calculatedData.rating, 0);
    skill += bestScores.reduce((a, r) => a + r.calculatedData.rating, 0);

    return skill;
}

export async function CalculateCustomRatings(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    logger: KtLogger
): Promise<Partial<Record<CustomCalcNames, number>>> {
    // @ts-expect-error too lazy to type this properly
    const customRatingFns = CUSTOM_RATING_FUNCTIONS?.[game]?.[playtype];

    if (!customRatingFns) {
        return {};
    }

    const ratings: Record<string, number> = {};
    for (const key in customRatingFns) {
        // eslint-disable-next-line no-await-in-loop
        ratings[key] = await customRatingFns[key](game, playtype, userID, logger);
    }

    return ratings as Record<CustomCalcNames, number>;
}
