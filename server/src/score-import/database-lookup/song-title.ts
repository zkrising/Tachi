import { Game, AnySongDocument } from "kamaitachi-common";
import { FindOneResult } from "monk";
import db from "../../db/db";

/**
 * Finds a song document for the given game with the given title (or alt-title)
 * The third parameter - version - is used to distinguish between older versions of charts
 * depending on what version of the .csv is currently being imported.
 * @param game - The game to search upon.
 * @param title - The song title to match.
 * @param version - The version a song should be in to be counted.
 * @returns AnySongDocument
 */
export function FindSongOnTitleVersion<G extends Game>(
    game: G,
    title: string,
    version: string
): Promise<FindOneResult<AnySongDocument>> {
    // @PERF: Performance should be tested here by having a utility field for all-titles.
    return db.songs[game].findOne({
        versions: version,
        $or: [
            {
                title: title,
            },
            {
                "alt-titles": title,
            },
        ],
    });
}

/**
 * Finds a song document for the given game with the given title (or alt-title).
 * This is NOT the preferred way to find a song, as encodings, and typos, make this
 * rather difficult. Prefer other functions!
 * @param game - The game to search upon.
 * @param title - The song title to match.
 * @returns AnySongDocument
 */
export function FindSongOnTitle(
    game: Game,
    title: string
): Promise<FindOneResult<AnySongDocument>> {
    db.songs[game];
    return db.songs[game].findOne({
        $or: [
            {
                title: title,
            },
            {
                "alt-titles": title,
            },
        ],
    });
}
