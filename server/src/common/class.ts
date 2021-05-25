import { Game, integer, Playtypes, UserGameStats } from "kamaitachi-common";
import { ClassData, gameClassValues } from "kamaitachi-common/js/game-classes";
import db from "../db/db";
import CreateLogCtx from "./logger";

const logger = CreateLogCtx(__filename);

export function GetClassSetsForGamePT(game: Game, playtype: Playtypes[Game]) {
    // @ts-expect-error its confused about game+pt permutations
    return gameClassValues[game]?.[playtype] as Record<string, ClassData> | undefined;
}

/**
 * Returns the provided class if it is greater than the one in userGameStats
 * @returns The provided class if it is greater, NULL if there is nothing
 * to compare to, and FALSE if it is worse or equal.
 */
export function ReturnClassIfGreater(
    game: Game,
    playtype: Playtypes[Game],
    setName: string,
    newClass: string,
    userGameStats?: UserGameStats | null
) {
    const classSets = GetClassSetsForGamePT(game, playtype);

    if (!classSets) {
        logger.error(`${game} ${playtype} Does not have any classes.`);
        throw new Error(`${game} ${playtype} Does not have any classes.`);
    }

    const gcv: ClassData = classSets[setName];

    if (gcv === undefined) {
        logger.error(`Invalid classKey ${setName}. Cannot process class.`);
        throw new Error(`Invalid classKey ${setName}. Cannot process class.`);
    }

    const newClassInfo = gcv[newClass];

    if (!userGameStats) {
        return null;
    }

    const val = newClassInfo.index;
    const pastClass = userGameStats.classes[setName];

    if (!pastClass) {
        return null;
    }

    const pastVal = gcv[pastClass].index;

    if (val > pastVal) {
        return newClass;
    }

    return false;
}

/**
 * Updates a user's class value if it is greater than the one in their
 * UserGameStats.
 * @returns False if nothing was updated.
 * Null if it was updated because there was nothing in UserGameStats to
 * compare to.
 * True if it was updated because it was better than UserGameStats.
 */
export async function UpdateClassIfGreater(
    userID: integer,
    game: Game,
    playtype: Playtypes[Game],
    classKey: string,
    newClass: string
) {
    const userGameStats = await db["game-stats"].findOne({ userID, game, playtype });
    const isGreater = ReturnClassIfGreater(game, playtype, classKey, newClass, userGameStats);

    if (isGreater === false) {
        return false;
    }

    if (userGameStats) {
        await db["game-stats"].update(
            { userID, game, playtype },
            { $set: { [`classes.${classKey}`]: newClass } }
        );
    } else {
        // insert new game stats for this user - this is an awkward place
        // to call this - maybe we should call it elsewhere.
        await db["game-stats"].insert({
            userID,
            game,
            playtype,
            customRatings: {},
            lampRating: 0,
            rating: 0,
            classes: {
                classKey: newClass,
            },
        });
        logger.info(`Created new player gamestats for ${userID} ${game} (${playtype})`);
    }

    if (isGreater === null) {
        // @todo #99 REDIS-IPC new class achieved

        return null;
    } else {
        // @todo #99 REDIS-IPC class improved

        return true;
    }
}
