/* eslint-disable @typescript-eslint/no-explicit-any */

import { SongDocument } from "tachi-common";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"chunithm"> {
	const newSongDoc: SongDocument<"chunithm"> = {
		title: c.title,
		artist: c.artist,
		id: c.id,
		firstVersion: c.firstAppearance,
		"alt-titles": c["alt-titles"].filter((e: string) => e !== c.title),
		"search-titles": c["search-titles"]
			.map((e: string) => e.toString())
			.filter((e: string) => e !== c.title),
		data: {
			genre: c.genre,
		},
	};

	return newSongDoc;
}

(async () => {
	await MigrateRecords(db.songs.chunithm, "songs-chunithm", ConvertFn);

	process.exit(0);
})();
