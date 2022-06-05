import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import { EscapeStringRegexp } from "utils/misc";
import { GetOnlineCutoff } from "utils/user";
import type { FilterQuery } from "mongodb";
import type { ICollection } from "monk";
import type {
	ChartDocument,
	FolderDocument,
	Game,
	integer,
	Playtype,
	PublicUserDocument,
	SessionDocument,
	SongDocument,
} from "tachi-common";

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
	collection: ICollection<T>,
	search: string,
	existingMatch: FilterQuery<T> = {},
	limit = 100
): Promise<Array<T & { __textScore: number }>> {
	const agg: Promise<Array<T & { __textScore: number }>> = collection.aggregate([
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
		{ $unset: "_id" },
	]);

	return agg.catch((err: unknown) => {
		logger.error(
			`An error occured while trying to $text search collection ${collection.name}. Does this have a $text index?`,
			{ err }
		);

		// throw it up further
		throw err;
	});
}

export type SongSearchReturn = SongDocument & {
	__textScore: number;
};

export function SearchSpecificGameSongs(
	game: Game,
	search: string,
	limit = 100
): Promise<Array<SongSearchReturn>> {
	return SearchCollection(db.songs[game], search, {}, limit);
}

export async function SearchGameSongsAndCharts(
	game: Game,
	search: string,
	playtype?: Playtype,
	limit = 100
) {
	const songs = await SearchSpecificGameSongs(game, search, limit);

	const chartQuery: FilterQuery<ChartDocument> = {
		songID: { $in: songs.map((e) => e.id) },
	};

	if (playtype) {
		chartQuery.playtype = playtype;
	}

	const charts = (await db.charts[game].find(chartQuery)) as Array<ChartDocument>;

	return { songs, charts };
}

export function SearchSessions(
	search: string,
	game?: Game,
	playtype?: Playtype,
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

	if (userID !== undefined) {
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

	const matchQuery: FilterQuery<PublicUserDocument> = {
		usernameLowercase: { $regex: new RegExp(regexEsc, "u") },
	};

	if (matchOnline) {
		matchQuery.lastSeen = { $gt: GetOnlineCutoff() };
	}

	return db.users.find(matchQuery, {
		limit: 25,
	});
}

/**
 * Terrible function name!
 * Searches a single game, but optimised for the searchAllGames return.
 */
async function SearchAllGamesSingleGame(game: Game, search: string) {
	const songs = (await SearchSpecificGameSongs(game, search, 10)) as Array<
		SongSearchReturn & {
			game: Game;
		}
	>;

	for (const song of songs) {
		song.game = game;
	}

	return songs;
}

/**
 * Searches all games' songs.
 */
export async function SearchAllGamesSongs(search: string) {
	return SearchGamesSongs(search, TachiConfig.GAMES);
}

export async function SearchGamesSongs(search: string, games: Array<Game>) {
	const promises = [];

	for (const game of games) {
		promises.push(SearchAllGamesSingleGame(game, search));
	}

	const res = await Promise.all(promises);

	return res.flat(1).sort((a, b) => b.__textScore - a.__textScore);
}

export async function SearchForChartHash(search: string) {
	const results = (await Promise.all([
		db.charts.bms.findOne({ $or: [{ "data.hashMD5": search }, { "data.hashSHA256": search }] }),
		db.charts.pms.findOne({ $or: [{ "data.hashMD5": search }, { "data.hashSHA256": search }] }),
		db.charts.usc.findOne({ "data.hashSHA1": search }),
	])) as [ChartDocument | null, ChartDocument | null, ChartDocument | null];

	const [bmsChart, pmsChart, uscChart] = results;

	const songs = [];
	const charts = results.filter((e) => e !== null) as Array<ChartDocument>;

	if (bmsChart) {
		songs.push(
			AddGamePropToSong(
				(await db.songs.bms.findOne({
					id: bmsChart.songID,
				}))!,
				"bms"
			)
		);
	}

	if (pmsChart) {
		songs.push(
			AddGamePropToSong(
				(await db.songs.pms.findOne({
					id: pmsChart.songID,
				}))!,
				"pms"
			)
		);
	}

	if (uscChart) {
		songs.push(
			AddGamePropToSong(
				(await db.songs.usc.findOne({
					id: uscChart.songID,
				}))!,
				"usc"
			)
		);
	}

	return { songs, charts };
}

export function SearchFolders(
	search: string,
	existingMatch?: FilterQuery<FolderDocument>,
	limit?: integer
) {
	return SearchCollection(db.folders, search, existingMatch, limit);
}

function AddGamePropToSong(songDocument: SongDocument, game: Game): SongDocument & { game: Game } {
	// @ts-expect-error Yep, that's intentional.
	songDocument.game = game;

	return songDocument as SongDocument & { game: Game };
}
