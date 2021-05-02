import { Game, Playtypes, integer, UserGameStats } from "kamaitachi-common";
import { gameClassValues, ClassData, ClassInfo } from "kamaitachi-common/js/game-classes";
import deepmerge from "deepmerge";
import db from "../../../db/db";
import { KtLogger } from "../../../types";

export interface ClassHandler {
    (
        game: Game,
        playtype: Playtypes[Game],
        userID: integer,
        customRatings: Record<string, number>
    ): Promise<Record<string, string>>;
}

type ClassHandlerMap = {
    [G in Game]:
        | {
              [P in Playtypes[G]]: ClassHandler;
          }
        | null;
};

// stub functions, see githubissues

// eslint-disable-next-line require-await
async function CalculateGitadoraColour(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>
): Promise<Record<string, string>> {
    throw new Error("Not implemented.");
}

// eslint-disable-next-line require-await
async function CalculateJubeatColour(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>
): Promise<Record<string, string>> {
    throw new Error("Not implemented.");
}

/**
 * Describes the "Default" class handlers for a game, I.E. ones that are
 * always meant to be called when new scores are found.
 */
const DEFAULT_CLASS_HANDLERS: ClassHandlerMap = {
    iidx: null,
    bms: null,
    chunithm: null,
    ddr: null,
    gitadora: {
        Gita: CalculateGitadoraColour,
        Dora: CalculateGitadoraColour,
    },
    jubeat: {
        Single: CalculateJubeatColour,
    },
    maimai: null,
    museca: null,
    popn: null,
    sdvx: null,
    usc: null,
};

/**
 * Calculates a Users' Game Stats Classes. This function is rather complex, because the reality is rather complex.
 *
 * A class is simply a hard bounded division dependent on a user. Such as a Dan or a skill level dependent on a statistic.
 * Not all services expose this information in the same way, so this function takes an async resolve function,
 * which is allowed to return its own classes. These will be merged with the classes that *we* can calculate.
 *
 * As an example, we are always able to calculate things like Gitadora's colours. We know the users' skill statistic,
 * and a colour is just between X-Y skill. However, we cannot always calculate something like IIDX's dans. Infact,
 * there's no calculation involved. We need to instead request this information from a service. For things like arcana
 * they exposes this on a dedicated endpoint.
 * The custom function allows us to request that data from a custom endpoint, and merge it with things we can always
 * calculate.
 *
 * @param customRatings - A users customRatings. This is calculated in rating.ts, and passed via update-ugs.ts.
 * We request this because we need it for things like gitadora's skill divisions - We don't need to calculate our skill
 * statistic twice if we just request it be passed to us!
 * @param ImportTypeClassResolveFn - The Custom Resolve Function that certain import types may pass to us as a means
 * for retrieving information about a class. This returns the same thing as this function, and it is merged with the
 * defaults.
 */
export async function CalculateUGSClasses(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>,
    ImportTypeClassResolveFn: ClassHandler | null,
    logger: KtLogger
): Promise<Record<string, string>> {
    let classes: Record<string, string> = {};

    if (DEFAULT_CLASS_HANDLERS[game]) {
        // @ts-expect-error This one sucks - I need to look into a better way of representing these types
        classes = await DEFAULT_CLASS_HANDLERS[game][playtype](
            game,
            playtype,
            userID,
            customRatings
        );
    }

    if (ImportTypeClassResolveFn) {
        classes = deepmerge(
            classes,
            await ImportTypeClassResolveFn(game, playtype, userID, customRatings)
        );
    }

    return classes;
}

/**
 * Calculates the class "deltas" for this users classes.
 * This is for calculating scenarios where a users class has improved (i.e. they have gone from 9th dan to 10th dan).
 *
 * Knowing this information allows us to attach it onto the import, and also emit things on redis
 * so that other services can listen for it. In the future we might allow webhooks, too.
 */
export function CalculateClassDeltas(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    classes: Record<string, string>,
    userGameStats: UserGameStats | null,
    logger: KtLogger
): ClassDelta[] {
    // @ts-expect-error It's complaining about Game+PT permutations instead of Game->PT permutations.
    let gcv = gameClassValues[game][playtype] as ClassData;

    if (Object.keys(classes).length !== 0 && !gcv) {
        logger.severe(
            `Classes were attempted to be processed for ${game} ${playtype}, but no class values exist for this.`,
            {
                classes,
            }
        );

        return [];
    }

    let deltas = [];

    for (const type in classes) {
        const gameClass = classes[type];
        let classInfo = gcv[gameClass];

        if (!classInfo) {
            logger.severe(
                `Class ${type}:${gameClass} was assigned, but this does not exist for ${game} ${playtype}? Unassigning this and continuing.`
            );

            delete classes[type];
            continue;
        }

        if (!userGameStats) {
            // @todo REDISIPC-New Class Achieved
            deltas.push({
                old: null,
                new: gameClass,
            });
        } else {
            let pastClass = userGameStats.classes[type];
            let pastVal = gcv[pastClass];

            let thisIndex = classInfo.index;

            let pastIndex;
            if (!pastVal) {
                logger.severe(
                    `UserID ${userID} has an invalid class of ${type} - This does not exist in GCV. Ignoring??`
                );
                pastIndex = -1;
            } else {
                pastIndex = pastVal.index;
            }

            if (thisIndex > pastIndex) {
                // @todo REDISIPC-Class Improved!
                deltas.push({
                    old: userGameStats.classes[pastClass],
                    new: gameClass,
                });
            }
        }
    }

    return deltas;
}
