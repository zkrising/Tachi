import { SongDocument } from "kamaitachi-common";
import { gameOrders } from "kamaitachi-common/js/config";
import db from "../../db/db";
import { rootLogger } from "../../logger";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"iidx"> {
    const newSongDoc: SongDocument<"iidx"> = {
        title: c.title,
        artist: c.artist,
        id: c.id,
        isAvailable: true, // NOT NECESSARILY
        firstVersion: c.firstAppearance,
        "alt-titles": c["alt-titles"].filter((e: string) => e !== c.title),
        "search-titles": c["search-titles"]
            .map((e: string) => e.toString())
            .filter((e: string) => e !== c.title),
        versions: [], // sentinel
        data: {
            genre: c.genre,
        },
    };

    let idx = gameOrders.iidx.indexOf(c.firstAppearance);

    if (idx === -1) {
        rootLogger.warn(`Invalid firstAppearance of ${c.firstAppearance}, running anyway.`);
        newSongDoc.versions = [c.firstAppearance];
    } else {
        newSongDoc.versions = gameOrders.iidx.slice(idx);
    }

    return newSongDoc;
}

(async () => {
    await MigrateRecords(db.songs.iidx, "songs-iidx", ConvertFn);

    process.exit(0);
})();
