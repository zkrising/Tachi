import { Game, Playtypes, SongDocument, AnyChartDocument } from "tachi-common";
import db from "../../external/mongo/db";
import { FilterQuery } from "mongodb";

export type SongSearchReturn = {
    __textScore: number;
} & SongDocument<Game>;

export async function SearchGameSongs(
    game: Game,
    search: string,
    limit = 100
): Promise<SongSearchReturn[]> {
    const res = await db.songs[game].aggregate([
        { $match: { $text: { $search: search } } },
        // This is a weird optimisation, but generally
        // the less data we return the better
        // we're projecting __textScore here, and we
        // use that opportunity to limit our returns
        // generously.
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
    ]);

    return res;
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

    const charts = await db.charts[game].find(chartQuery);

    return { songs, charts };
}
