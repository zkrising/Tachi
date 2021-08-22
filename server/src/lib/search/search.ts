import { ICollection } from "monk";
import { FilterQuery } from "mongodb";
import CreateLogCtx from "lib/logger/logger";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import {
	Game,
	SessionDocument,
	Playtypes,
	SongDocument,
	ChartDocument,
	PrivateUserDocument,
	integer,
} from "tachi-common";
import { EscapeStringRegexp } from "utils/misc";
import { GetOnlineCutoff, OMIT_PRIVATE_USER_RETURNS } from "utils/user";
import { ServerTypeInfo } from "lib/setup/config";

const logger = CreateLogCtx(__filename);

/**
 * Perform a $text index search on a collection.
 *
 * This throws an error if the collection does not have a text index.
 *
 * @param existingMatch - An existing $match query to further filter results
 * by.
 */
export function SearchCollection<T>(
	collection: ICollection,
	search: string,
	existingMatch: FilterQuery<T> = {},
	limit = 100
): Promise<(T & { __textScore: number })[]> {
	return collection
		.aggregate([
			{
				$match: deepmerge({ $text: { $search: search } }, existingMatch),
			},
			// Project the __textScore field on so we can sort
			// based on search proximity to query
			{
				$addFields: {
					__textScore: { $meta: "textScore" },
				},
			},
			// sort by quality of match
			{ $sort: { __textScore: -1 } },
			// hide nonsense
			{ $match: { __textScore: { $gt: 0.25 } } },
			{ $limit: limit },
		])
		.catch((err) => {
			logger.error(
				`An error occured while trying to $text search collection ${collection.name}. Does this have a $text index?`,
				{ err }
			);

			// throw it up further
			throw err;
		});
}

export type SongSearchReturn = {
	__textScore: number;
} & SongDocument<Game>;

export function SearchGameSongs(
	game: Game,
	search: string,
	limit = 100
): Promise<SongSearchReturn[]> {
	return SearchCollection(db.songs[game], search, {}, limit);
}

export async function SearchGameSongsAndCharts(
	game: Game,
	search: string,
	playtype?: Playtypes[Game],
	limit = 100
) {
	const songs = await SearchGameSongs(game, search, limit);

	const chartQuery: FilterQuery<ChartDocument> = {
		songID: { $in: songs.map((e) => e.id) },
	};

	if (playtype) {
		chartQuery.playtype = playtype;
	}

	const charts = (await db.charts[game].find(chartQuery)) as ChartDocument[];

	return { songs, charts };
}

export function SearchSessions(
	search: string,
	game?: Game,
	playtype?: Playtypes[Game],
	userID?: integer,
	limit = 100
) {
	const baseMatch: FilterQuery<SessionDocument> = {};

	if (game) {
		baseMatch.game = game;
	}

	if (playtype) {
		baseMatch.playtype = playtype;
	}

	if (userID) {
		baseMatch.userID = userID;
	}

	return SearchCollection(db.sessions, search, baseMatch, limit);
}

/**
 * Searches the user collection for users that are *like* the
 * provided string.
 *
 * We use regex matching because $text matches words, and users
 * aren't allowed spaces in their name. In short, $text is very
 * poor at actually matching usernames.
 */
export function SearchUsersRegExp(search: string, matchOnline = false) {
	const regexEsc = EscapeStringRegexp(search.toLowerCase());

	const matchQuery: FilterQuery<PrivateUserDocument> = {
		usernameLowercase: { $regex: new RegExp(regexEsc, "u") },
	};

	if (matchOnline) {
		matchQuery.lastSeen = { $gt: GetOnlineCutoff() };
	}

	return db.users.find(matchQuery, {
		limit: 25,
		projection: OMIT_PRIVATE_USER_RETURNS,
	});
}

/**
 * Terrible function name!
 * Searches a single game, but optimised for the searchAllGames return.
 */
async function SearchAllGamesSingleGame(game: Game, search: string) {
	const songs = (await SearchGameSongs(game, search, 10)) as (SongSearchReturn & {
		game: Game;
	})[];

	for (const song of songs) {
		song.game = game;
	}

	return songs;
}

/**
 * Searches all games' songs.
 */
export async function SearchAllGamesSongs(search: string) {
	const promises = [];

	for (const game of ServerTypeInfo.supportedGames) {
		promises.push(SearchAllGamesSingleGame(game, search));
	}

	const res = await Promise.all(promises);

	return res.flat(1).sort((a, b) => b.__textScore - a.__textScore);
}
