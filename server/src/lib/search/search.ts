import db from "external/mongo/db";
import { AsyncFzf } from "fzf";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import { CreateSongMap, SplitGPT } from "tachi-common";
import { GetSongForIDGuaranteed } from "utils/db";
import { EscapeStringRegexp } from "utils/misc";
import { GetOnlineCutoff } from "utils/user";
import type { FilterQuery } from "mongodb";
import type { ICollection } from "monk";
import type {
	ChartDocument,
	FolderDocument,
	GPTString,
	GPTStrings,
	Game,
	Playtype,
	SessionDocument,
	SongDocument,
	UserDocument,
	integer,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

interface SearchControls {
	keys: Array<string>;
	primary: string;
}

const SEARCH_CONTROLS = {
	songs: {
		keys: ["title", "artist", "searchTerms", "altTitles"],
		primary: "id",
	},
	sessions: { keys: ["name"], primary: "sessionID" },
	goals: { keys: ["name"], primary: "goalID" },
	quests: { keys: ["name"], primary: "questID" },
	users: { keys: ["username"], primary: "id" },
	folders: { keys: ["name", "searchTerms"], primary: "folderID" },
} satisfies Partial<Record<keyof typeof db, SearchControls>>;

/**
 * Perform a $text index search on a collection.
 *
 * This throws an error if the collection does not have a text index.
 *
 * @param existingMatch - An existing $match query to further filter results
 * by.
 */
export async function SearchCollection<T extends object>(
	collection: ICollection<T>,
	search: string,
	searchMethod: keyof typeof SEARCH_CONTROLS,
	existingMatch: FilterQuery<T> = {},
	limit = 500
): Promise<Array<T & { __textScore: number }>> {
	const controls = SEARCH_CONTROLS[searchMethod];

	const projection = Object.fromEntries([...controls.keys, controls.primary].map((e) => [e, 1]));

	// we do the searching in-memory, because mongodb's search offerings are truly
	// abysmal. I'm sorry. The performance is fine. I think.
	const data = (await collection.find(existingMatch, { projection })) as Array<any>;

	const pkeys: Array<string> = [];
	const scores: Record<string, number> = {};

	// extremely slow, extremely inefficent, but whatever.
	// we'll live.
	await Promise.all(
		controls.keys.map(async (key) => {
			const fzf = new AsyncFzf(
				data.filter((e) => e[key]),
				{
					selector: (item) => item[key].toString(),
					limit,
				}
			);

			const results = await fzf
				.find(search)
				.then((data) => data.filter((d) => d.score > 100));

			for (const res of results) {
				const pkey = res.item[controls.primary];

				pkeys.push(pkey);

				const existingScore = scores[pkey];

				if (!existingScore || existingScore < res.score) {
					scores[pkey] = res.score;
				}
			}
		})
	);

	const documents: Array<any> = await (collection as ICollection).find({
		[controls.primary]: { $in: pkeys },
	});

	for (const doc of documents) {
		doc.__textScore = scores[doc[controls.primary]] ?? 0;
	}

	return documents;
}

export type SongSearchReturn = SongDocument & {
	__textScore: number;
};

export function SearchSpecificGameSongs(
	game: Game,
	search: string,
	limit = 100
): Promise<Array<SongSearchReturn>> {
	return SearchCollection(db.anySongs[game], search, "songs", {}, limit);
}

export async function SearchSpecificGameSongsAndCharts(
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

	const charts = (await db.anyCharts[game].find(chartQuery, { limit })) as Array<ChartDocument>;

	return { songs, charts };
}

/**
 * Search this Game/GPTs songs and charts, but globally.
 */
export async function SearchGlobalGameSongsAndCharts(
	game: Game,
	search: string,
	playtype?: Playtype,
	limit = 100
): Promise<Array<{ song: SongDocument; chart: ChartDocument; playcount: integer }>> {
	const songs = await SearchSpecificGameSongs(game, search, limit);

	const chartQuery: FilterQuery<ChartDocument> = {
		songID: { $in: songs.map((e) => e.id) },
	};

	if (playtype) {
		chartQuery.playtype = playtype;
	}

	const charts = (await db.anyCharts[game].find(chartQuery, { limit })) as unknown as Array<
		ChartDocument & { __playcount: integer }
	>;

	const playcounts: Array<{ _id: string; playcount: integer }> = await db.scores.aggregate([
		{
			$match: {
				chartID: { $in: charts.map((e) => e.chartID) },
			},
		},
		{
			$group: {
				_id: "$chartID",
				playcount: { $sum: 1 },
			},
		},
	]);

	const playcountLookup = Object.fromEntries(playcounts.map((e) => [e._id, e.playcount]));
	const songMap = CreateSongMap(songs);

	const output = [];

	for (const chart of charts) {
		const song = songMap.get(chart.songID);

		if (!song) {
			logger.warn(`Failed to find parent song for ${chart.songID} (${game})? Skipping.`);
			continue;
		}

		output.push({
			song,
			chart,
			playcount: playcountLookup[chart.chartID] ?? 0,
		});
	}

	return output;
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

	return SearchCollection(db.sessions, search, "sessions", baseMatch, limit);
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

	const matchQuery: FilterQuery<UserDocument> = {
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

export async function SearchGamesSongsCharts(search: string, gpts: Array<GPTString>) {
	const promises = [];

	const results: Partial<
		Record<GPTString, Array<{ song: SongDocument; chart: ChartDocument; playcount: integer }>>
	> = {};

	for (const gpt of gpts) {
		const [game, playtype] = SplitGPT(gpt);

		promises.push(
			SearchGlobalGameSongsAndCharts(game, search, playtype).then((res) => {
				results[gpt] = res;
			})
		);
	}

	await Promise.all(promises);

	return results;
}

export async function SearchForChartHash(search: string) {
	const results = await Promise.all([
		db.charts.bms.find({ $or: [{ "data.hashMD5": search }, { "data.hashSHA256": search }] }),
		db.charts.pms.find({ $or: [{ "data.hashMD5": search }, { "data.hashSHA256": search }] }),
		db.charts.usc.find({ "data.hashSHA1": search }),
		db.charts.itg.find({ "data.hashGSv3": search }),
	]);

	const [bmsCharts, pmsCharts, uscCharts, itgCharts] = results;

	const output: Record<
		GPTStrings["bms" | "itg" | "pms" | "usc"],
		Array<{
			song: SongDocument;
			chart: ChartDocument;
			playcount: null;
		}>
	> = {
		"bms:7K": [],
		"bms:14K": [],
		"pms:Controller": [],
		"pms:Keyboard": [],
		"usc:Controller": [],
		"usc:Keyboard": [],
		"itg:Stamina": [],
	};

	const zip = [
		["bms", bmsCharts],
		["pms", pmsCharts],
		["itg", itgCharts],
		["usc", uscCharts],
	] as const;

	for (const [game, charts] of zip) {
		for (const chart of charts as Array<ChartDocument>) {
			const song = await GetSongForIDGuaranteed(game, chart.songID);

			// @ts-expect-error ts doesn't like this hack but it'll work.
			output[`${game}:${chart.playtype}`]!.push({
				song,
				chart,
				playcount: null,
			});
		}
	}

	return output;
}

export function SearchFolders(
	search: string,
	existingMatch?: FilterQuery<FolderDocument>,
	limit?: integer
) {
	return SearchCollection(db.folders, search, "folders", existingMatch, limit);
}

function AddGamePropToSong(songDocument: SongDocument, game: Game): SongDocument & { game: Game } {
	// @ts-expect-error Yep, that's intentional.
	songDocument.game = game;

	return songDocument as SongDocument & { game: Game };
}
