/* eslint-disable @typescript-eslint/no-explicit-any */
import { SongDocument } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"sdvx"> {
	const newSongDoc: SongDocument<"sdvx"> = {
		title: c.title,
		artist: c.artist,
		id: c.id,
		firstVersion: c.firstAppearance,
		altTitles: c.altTitles.filter((e: string) => e !== c.title),
		searchTerms: c.searchTerms
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
