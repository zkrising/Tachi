/* eslint-disable @typescript-eslint/no-explicit-any */
import { SongDocument } from "tachi-common";
import { gameOrders } from "tachi-common/js/config";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): SongDocument<"ddr"> {
	const newSongDoc: SongDocument<"ddr"> = {
		title: c.title,
		artist: c.artist,
		id: c.id,
		firstVersion: c.firstAppearance,
		"alt-titles": c["alt-titles"] ? c["alt-titles"].filter((e: string) => e !== c.title) : [],
		"search-titles": c["search-title"]
			.filter((e: string) => !!e)
			.map((e: string) => e.toString())
			.filter((e: string) => e !== c.title),
		data: {},
	};

	return newSongDoc;
}

(async () => {
	await MigrateRecords(db.songs.ddr, "songs-ddr", ConvertFn);

	process.exit(0);
})();
