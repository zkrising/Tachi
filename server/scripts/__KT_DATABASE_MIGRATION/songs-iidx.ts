/* eslint-disable @typescript-eslint/no-explicit-any */
import { SongDocument } from "tachi-common";
import { gameOrders } from "tachi-common/js/config";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"iidx"> {
	const newSongDoc: SongDocument<"iidx"> = {
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
	await MigrateRecords(db.songs.iidx, "songs-iidx", ConvertFn);

	process.exit(0);
})();
