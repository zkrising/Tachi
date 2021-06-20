import { ICollection } from "monk";
import { FilterQuery } from "mongodb";
import CreateLogCtx from "../logger/logger";
import deepmerge from "deepmerge";
import db from "../../external/mongo/db";
import {
	Game,
	SessionDocument,
	Playtypes,
	SongDocument,
	AnyChartDocument,
	integer,
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

	const chartQuery: FilterQuery<AnyChartDocument> = {
		songID: { $in: songs.map((e) => e.id) },
	};

	if (playtype) {
		chartQuery.playtype = playtype;
	}

	const charts = (await db.charts[game].find(chartQuery)) as AnyChartDocument[];

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
