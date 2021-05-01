import { Game, Playtypes, integer } from "kamaitachi-common";
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

export async function CalculateUGSClasses(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>,
    CustomFn: ClassHandler | null,
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

    if (CustomFn) {
        classes = deepmerge(classes, await CustomFn(game, playtype, userID, customRatings));
    }

    return classes;
}
