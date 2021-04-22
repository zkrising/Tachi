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
        isRemoved: false, // NOT REALLY
        "alt-titles": c["alt-titles"],
        "search-titles": c["search-titles"],
        version: [], // sentinel
        data: {
            genre: c.genre,
        },
    };

    let idx = gameOrders.iidx.indexOf(c.firstAppearance);

    if (idx === -1) {
        rootLogger.warn(`Invalid firstAppearance of ${c.firstAppearance}, running anyway.`);
        newSongDoc.version = [c.firstAppearance];
    } else {
        newSongDoc.version = gameOrders.iidx.slice(idx);
    }

    return newSongDoc;
}

(async () => {
    await MigrateRecords(db.songs.iidx, "songs-iidx", ConvertFn);

    process.exit(0);
})();
