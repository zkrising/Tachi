/* eslint-disable @typescript-eslint/no-explicit-any */
import { SongDocument } from "tachi-common";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"museca"> {
    const newSongDoc: SongDocument<"museca"> = {
        title: c.title,
        artist: c.artist,
        id: c.id,
        firstVersion: c.firstAppearance,
        "alt-titles": [],
        "search-titles": [],
        data: {
            titleJP: c.title_jp,
            artistJP: c.artist_jp,
        },
    };

    return newSongDoc;
}

(async () => {
    await MigrateRecords(db.songs.museca, "songs-museca", ConvertFn);

    process.exit(0);
})();
