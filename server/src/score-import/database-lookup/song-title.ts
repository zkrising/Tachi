import { Game, AnySongDocument } from "kamaitachi-common";
import { FindOneResult } from "monk";
import db from "../../db/db";

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
    // @PERF: Performance should be tested here by having a utility field for all-titles.
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
