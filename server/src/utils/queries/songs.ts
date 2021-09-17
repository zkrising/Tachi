import { Game, SongDocument, integer } from "tachi-common";
import { FindOneResult } from "monk";
import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import { InternalFailure } from "lib/score-import/framework/common/converter-failures";
import { EscapeStringRegexp } from "../misc";

/**
 * Finds a song document for the given game with the given title (or alt-title).
 * This is NOT the preferred way to find a song, as encodings, and typos, make this
 * rather difficult. Prefer other functions!
 * @param game - The game to search upon.
 * @param title - The song title to match.
 * @returns SongDocument
 */
export function FindSongOnTitle(game: Game, title: string): Promise<FindOneResult<SongDocument>> {
	// @optimisable: Performance should be tested here by having a utility field for all-titles.
	return db.songs[game].findOne({
		$or: [
			{
				title: title,
			},
			{
				altTitles: title,
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
): Promise<FindOneResult<SongDocument>> {
	// @optimisable: Performance should be tested here by having a utility field for all-titles.

	const regex = new RegExp(`^${EscapeStringRegexp(title)}$`, "iu");
	return db.songs[game].findOne({
		$or: [
			{
				title: { $regex: regex },
			},
			{
				altTitles: { $regex: regex },
			},
		],
	});
}

/**
 * Finds a song document based on the Tachi songID. Depending on the database this might
 * also be the in-game-ID.
 * @param game - The game to search upon.
 * @param songID - The song ID to match.
 * @returns SongDocument
 */
export function FindSongOnID(game: Game, songID: integer): Promise<FindOneResult<SongDocument>> {
	return db.songs[game].findOne({
		id: songID,
	});
}

export async function FindSongOnIDGuaranteed(game: Game, songID: integer, logger: KtLogger) {
	const song = await FindSongOnID(game, songID);

	if (!song) {
		logger.severe(`Song-Chart desync for ${songID}. Has charts, but no song.`);
		throw new InternalFailure(`Song-Chart desync for ${songID}. Has charts, but no song.`);
	}

	return song;
}
