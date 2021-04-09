import { Game, SongDocument } from "kamaitachi-common";
import db from "../../db";

/**
 * Finds a song document for the given game with the given title (or alt-title)
 * The third parameter - version - is used to distinguish between older versions of charts
 * depending on what version of the .csv is currently being imported.
 * @param game - The game to search upon.
 * @param title - The song title to match.
 * @param version - The version a song should be in to be counted.
 * @returns SongDocument
 */
export function FindSongOnTitleVersion(game: Game, title: string, version: string | number) {
    return db.get<SongDocument>(`songs-${game}`).findOne({
        "data.version": version,
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
 * @returns SongDocument
 */
export function FindSongOnTitle(game: Game, title: string) {
    return db.get<SongDocument>(`songs-${game}`).findOne({
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
