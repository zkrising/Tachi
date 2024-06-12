import { EscapeStringRegexp } from "../misc";
import db from "external/mongo/db";
import {
	AmbiguousTitleFailure,
	InternalFailure,
} from "lib/score-import/framework/common/converter-failures";
import type { KtLogger } from "lib/logger/logger";
import type { FindOneResult } from "monk";
import type { Game, integer, SongDocument } from "tachi-common";

/**
 * Finds a song document for the given game with the given title (or alt-title).
 * This is NOT the preferred way to find a song, as encodings, and typos, make this
 * rather difficult. Prefer other functions!
 * @param game - The game to search upon.
 * @param title - The song title to match.
 * @returns SongDocument
 */
export async function FindSongOnTitle(game: Game, title: string): Promise<SongDocument | null> {
	// @optimisable: Performance should be tested here by having a utility field for all-titles.
	const res = await db.anySongs[game].find(
		{
			$or: [
				{
					title,
				},
				{
					altTitles: title,
				},
			],
		},
		{
			limit: 2,
		}
	);

	if (res.length === 2) {
		throw new AmbiguousTitleFailure(
			`Multiple songs exist with the title ${title}. We cannot resolve this. Please try and use a different song resolution method.`
		);
	}

	return res[0] ?? null;
}

/**
 * Finds a song on a song title case-insensitively.
 * This is needed for services that provide horrifically mutated string titles.
 */
export async function FindSongOnTitleInsensitive(
	game: Game,
	title: string
): Promise<SongDocument | null> {
	// @optimisable: Performance should be tested here by having a utility field for all-titles.

	const regex = new RegExp(`^${EscapeStringRegexp(title)}$`, "iu");

	const res = await db.anySongs[game].find(
		{
			$or: [
				{
					title: { $regex: regex },
				},
				{
					altTitles: { $regex: regex },
				},
			],
		},
		{
			limit: 2,
		}
	);

	if (res.length === 2) {
		throw new AmbiguousTitleFailure(
			`Multiple songs exist with the case-insensitive title ${title}. We cannot resolve this. Please try and use a different song resolution method.`
		);
	}

	return res[0] ?? null;
}

/**
 * Finds a song document based on the Tachi songID. Depending on the database this might
 * also be the in-game-ID.
 * @param game - The game to search upon.
 * @param songID - The song ID to match.
 * @returns SongDocument
 */
export function FindSongOnID(game: Game, songID: integer): Promise<FindOneResult<SongDocument>> {
	return db.anySongs[game].findOne({
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
