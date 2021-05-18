import { Game, AnySongDocument, integer } from "kamaitachi-common";
import { FindOneResult } from "monk";
import db from "../../db/db";
import { EscapeStringRegexp } from "../util";

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

/**
 * Finds a song on a song title case-insensitively.
 * This is needed for services that provide horrifically mutated string titles.
 */
export function FindSongOnTitleInsensitive(
    game: Game,
    title: string
): Promise<FindOneResult<AnySongDocument>> {
    // @PERF: Performance should be tested here by having a utility field for all-titles.

    let regex = new RegExp(`^${EscapeStringRegexp(title)}$`, "iu");
    return db.songs[game].findOne({
        $or: [
            {
                title: { $regex: regex },
            },
            {
                "alt-titles": { $regex: regex },
            },
        ],
    });
}

/**
 * Finds a song document based on the Kamaitachi songID. Depending on the database this might
 * also be the in-game-ID.
 * @param game - The game to search upon.
 * @param songID - The song ID to match.
 * @returns AnySongDocument
 */
export function FindSongOnID(game: Game, songID: integer): Promise<FindOneResult<AnySongDocument>> {
    return db.songs[game].findOne({
        id: songID,
    });
}
