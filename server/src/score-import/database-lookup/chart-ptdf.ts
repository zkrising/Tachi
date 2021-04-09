// Chart "Playtype+Difficulty" lookup. This is a common way of resolving Kamaitachi charts.

import {
    Difficulties,
    Game,
    integer,
    Playtypes,
    IDStrings,
    IDString,
    ChartDocument,
} from "kamaitachi-common";
import db from "../../db";

export function FindChartWithPTDF<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    // @ts-expect-error See kamaitachi-common.
    I extends IDStrings = IDString<G, P>
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
    return db.get<ChartDocument>(`charts-${game}`).findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
    });
}
