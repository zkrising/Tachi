import { Game, Playtypes, integer, IDStrings } from "kamaitachi-common";
import { GameClasses } from "kamaitachi-common/js/game-classes";

import { KtLogger } from "../../../logger/logger";

export type ScoreClasses = Partial<GameClasses<IDStrings>>;

export interface ClassHandler {
    (
        game: Game,
        playtype: Playtypes[Game],
        userID: integer,
        ratings: Record<string, number>,
        logger: KtLogger
    ): Promise<ScoreClasses> | ScoreClasses | undefined;
}
