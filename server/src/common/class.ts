import { Game, integer, Playtypes, UserGameStats } from "kamaitachi-common";
import { ClassData, gameClassValues } from "kamaitachi-common/js/game-classes";
import db from "../db/db";
import CreateLogCtx from "../logger";

const logger = CreateLogCtx("class.ts");

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
    // @ts-expect-error It's complaining about Game+PT permutations instead of Game->PT permutations.
    let gcv: ClassData = gameClassValues[game][playtype][setName];

    if (gcv === undefined) {
        logger.error(`Invalid classKey ${setName}. Cannot process class.`);
        throw new Error(`Invalid classKey ${setName}. Cannot process class.`);
    }

    let newClassInfo = gcv[newClass];

    if (!userGameStats) {
        return null;
    }

    let val = newClassInfo.index;
    let pastClass = userGameStats.classes[setName];

    if (!pastClass) {
        return null;
    }

    let pastVal = gcv[pastClass].index;

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
    newClass: string,
    userGameStats?: UserGameStats
) {
    let isGreater = ReturnClassIfGreater(game, playtype, classKey, newClass, userGameStats);

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
        // @todo REDIS-IPC new class achieved

        return null;
    } else {
        // @todo REDIS-IPC class improved

        return true;
    }
}
