/* eslint-disable @typescript-eslint/no-explicit-any */
import { SongDocument } from "tachi-common";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"gitadora"> {
	const newSongDoc: SongDocument<"gitadora"> = {
		title: c.title,
		artist: c.artist,
		id: c.id,
		firstVersion: c.firstAppearance,
		"alt-titles": c["alt-titles"] ? c["alt-titles"].filter((e: string) => e !== c.title) : [],
		"search-titles": c["search-titles"]
			.filter((e: string) => !!e)
			.map((e: string) => e.toString())
			.filter((e: string) => e !== c.title),
		data: {},
	};

	return newSongDoc;
}

(async () => {
	await MigrateRecords(db.songs.gitadora, "songs-gitadora", ConvertFn);

	process.exit(0);
})();
