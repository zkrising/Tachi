// Chart "Playtype+Difficulty" lookup. This is a common way of resolving Kamaitachi charts.

import { Difficulties, Game, integer, Playtypes, IDStrings } from "kamaitachi-common";
import db from "../../db/db";

export function FindChartWithPTDF<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
    return db.charts[game].findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
    });
}
