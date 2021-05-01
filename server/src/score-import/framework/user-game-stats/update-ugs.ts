// "rating" refers to a user's profile statistics, as in their "rating" on a game.
// Some games have dedicated methods to calculate statistics like these, other games do not.
// That's about all there is to it!

import { Game, Playtypes, integer, UserGameStats } from "kamaitachi-common";
import db from "../../../db/db";
import { KtLogger } from "../../../types";
import { CalculateUGSClasses, ClassHandler } from "./classes";
import { CalculateRatings, CalculateCustomRatings } from "./rating";

async function UpdateUsersGameStats(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customClassFn: ClassHandler | null,
    logger: KtLogger
) {
    let { rating, lampRating } = await CalculateRatings(game, playtype, userID, logger);
    let customRatings = await CalculateCustomRatings(game, playtype, userID, logger);

    let classes = await CalculateUGSClasses(
        game,
        playtype,
        userID,
        customRatings,
        customClassFn,
        logger
    );

    let newStats: UserGameStats = {
        game,
        playtype,
        userID,
        rating,
        lampRating,
        customRatings,
        classes,
    };

    await db["game-stats"].update(
        {
            game,
            playtype,
            userID,
        },
        {
            $set: newStats,
        },
        { upsert: true }
    );

    return newStats;
}
