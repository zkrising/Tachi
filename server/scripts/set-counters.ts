import { CounterDocument } from "tachi-common";
import db from "external/mongo/db";

(async () => {
	const uscSongCount = await db.songs.usc.find({});

	const Counters: CounterDocument[] = [
		{
			counterName: "users",
			value: 2,
		},
		{
			counterName: "usc-song-id",
			value: uscSongCount.length + 1,
		},
	];

	db.counters.insert(Counters).then(() => {
		process.exit(0);
	});
})();
