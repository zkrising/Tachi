import db from "./db";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

export async function InitSequenceDocs() {
	await db.counters.remove({});

	const userWithLargestID = await db.users.findOne(
		{},
		{
			sort: {
				id: -1,
			},
		}
	);

	const largestBMSSongID = await db.songs.bms.findOne(
		{},
		{
			sort: {
				id: -1,
			},
		}
	);

	const largestPMSSongID = await db.songs.pms.findOne(
		{},
		{
			sort: {
				id: -1,
			},
		}
	);

	const Counters = [
		{
			counterName: "users",
			value: userWithLargestID ? userWithLargestID.id + 1 : 1,
		},
		{
			counterName: "bms-song-id",
			value: largestBMSSongID ? largestBMSSongID.id + 1 : 1,
		},
		{
			counterName: "pms-song-id",
			value: largestPMSSongID ? largestPMSSongID.id + 1 : 1,
		},
	];

	logger.verbose(
		`Setting Counters -> ${Counters.map((e) => `${e.counterName}: ${e.value}`).join(", ")}`
	);

	await db.counters.insert(Counters);
}
