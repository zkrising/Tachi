import { SongDocument } from "kamaitachi-common";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"sdvx"> {
    const newSongDoc: SongDocument<"sdvx"> = {
        title: c.title,
        artist: c.artist,
        id: c.id,
        firstVersion: c.firstAppearance,
        "alt-titles": c["alt-titles"].filter((e: string) => e !== c.title),
        "search-titles": c["search-titles"]
            .map((e: string) => e.toString())
            .filter((e: string) => e !== c.title),
        data: {
            uscEquiv: null,
        },
    };

    return newSongDoc;
}

(async () => {
    await MigrateRecords(db.songs.sdvx, "songs-sdvx", ConvertFn);

    process.exit(0);
})();
