// "rating" refers to a user's profile statistics, as in their "rating" on a game.
// Some games have dedicated methods to calculate statistics like these, other games do not.
// That's about all there is to it!

import { Game, Playtypes, integer, UserGameStats } from "kamaitachi-common";
import db from "../../../db/db";
import { KtLogger } from "../../../types";
import { CalculateClassDeltas, CalculateUGSClasses, ClassHandler } from "./classes";
import { CalculateRatings, CalculateCustomRatings } from "./rating";

export async function UpdateUsersGamePlaytypeStats(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customClassFn: ClassHandler | null,
    logger: KtLogger
) {
    let { rating, lampRating } = await CalculateRatings(game, playtype, userID, logger);
    let customRatings = await CalculateCustomRatings(game, playtype, userID, logger);

    // Attempt to find a users game stats if one already exists. If one doesn't exist,
    // this is this players first import for this game!
    let userGameStats = await db["game-stats"].findOne({
        game,
        playtype,
        userID,
    });

    logger.debug(`Calculating UGSClasses...`);

    let classes = await CalculateUGSClasses(
        game,
        playtype,
        userID,
        customRatings,
        customClassFn,
        logger
    );

    logger.debug(`Finished Calculating UGSClasses`);

    logger.debug(`Calculating Class Deltas...`);

    let deltas = CalculateClassDeltas(game, playtype, userID, classes, userGameStats, logger);

    logger.debug(`Had ${deltas.length} deltas.`);

    let newStats: UserGameStats = {
        game,
        playtype,
        userID,
        rating,
        lampRating,
        customRatings,
        classes,
    };

    if (userGameStats) {
        logger.debug(`Updated player gamestats for ${game} (${playtype})`);
        await db["game-stats"].update(
            {
                game,
                playtype,
                userID,
            },
            {
                $set: {
                    rating,
                    lampRating,
                    customRatings,
                    classes,
                },
            }
        );
    } else {
        logger.info(`Created new player gamestats for ${game} (${playtype})`);
        await db["game-stats"].insert(newStats);
    }

    return deltas;
}
