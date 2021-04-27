// Chart "Playtype+Difficulty" lookup. This is a common way of resolving Kamaitachi charts.

import { Difficulties, Game, integer, Playtypes, IDStrings } from "kamaitachi-common";
import db from "../../db/db";

/**
 * Find chart with PlaytypeDifficulty. This only finds charts that have `isPrimary` set to true.
 * If you want to find charts that are not primary, you need to use PTDFVersion.
 */
export function FindChartWithPTDF<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
    return db.charts[game].findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
        isPrimary: true,
    });
}

/**
 * Find chart with Playtype, Difficulty and a given version. This does not necessarily return a chart that has
 * `isPrimary` set.
 */
export function FindChartWithPTDFVersion<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I], version: string) {
    return db.charts[game].findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
        versions: version,
    });
}
