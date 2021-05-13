import { Difficulties, Game, integer, Playtypes, IDStrings } from "kamaitachi-common";
import db from "../../db/db";

/**
 * Find chart with PlaytypeDifficulty. This only finds charts that have `isPrimary` set to true.
 * If you want to find charts that are not primary, you need to use PTDFVersion.
 * @see FindChartWithPTDFVersion
 */
export function FindChartWithPTDF<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I]) {
    return db.charts[game].findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
        isPrimary: true,
    });
}

/**
 * Find chart with Playtype, Difficulty and a given version. This does not necessarily return a chart that has
 * `isPrimary` set.
 */
export function FindChartWithPTDFVersion<
    G extends Game = Game,
    P extends Playtypes[G] = Playtypes[G],
    I extends IDStrings = IDStrings
>(game: G, songID: integer, playtype: P, difficulty: Difficulties[I], version: string) {
    return db.charts[game].findOne({
        songID: songID,
        playtype: playtype,
        difficulty: difficulty,
        versions: version,
    });
}

/**
 * Finds a DDR Chart based on its "song hash".
 * Songs in DDR have a consistent checksum-like identifier used on the e-amusement website.
 * We can use this to locate a chart by combining it with a playtype and difficulty.
 *
 * Despite the potentially confusing name of "songHash", songs are NOT meant to store lookup-like tokens.
 * This is just for simplification reasons.
 * @param songHash The identifier for the song.
 * @param playtype The playtype for the chart.
 * @param difficulty The difficulty for the chart.
 */
export function FindDDRChartOnSongHash(
    songHash: string,
    // Technically both of these should be "ddr" instead of Game, but it proves hard to work with.
    playtype: Playtypes[Game],
    difficulty: Difficulties[IDStrings]
) {
    // note: this only works on accident because monk
    // allows any strings like "foo.bar".
    // We *should* normally cast this to ChartDocument<"ddr:SP" | "ddr:DP">
    return db.charts.ddr.findOne({
        "data.songHash": songHash,
        playtype,
        difficulty,
    });
}

export function FindBMSChartOnHash(hash: string) {
    return db.charts.bms.findOne({
        $or: [{ "data.hashMD5": hash }, { "data.hashSHA256": hash }],
    });
}
