import { Command } from "commander";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";

const program = new Command();
program.option("-f, --force", "Delete existing sequence documents and recreate them.");

program.parse(process.argv);
const options = program.opts();

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		if (options.force) {
			await db.counters.remove({});
		} else {
			const anyCounters = await db.counters.findOne();

			if (anyCounters) {
				throw new Error(
					`Counters are already in database, cannot create them without --force.`
				);
			}
		}

		const userWithLargestID = await db.users.findOne(
			{},
			{
				sort: {
					id: -1,
				},
			}
		);

		const largestUSCSongID = await db.songs.usc.findOne(
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

		const Counters = [
			{
				counterName: "users",
				value: userWithLargestID ? userWithLargestID.id + 1 : 1,
			},
			{
				counterName: "usc-song-id",
				value: largestUSCSongID ? largestUSCSongID.id + 1 : 1,
			},
			{
				counterName: "bms-song-id",
				value: largestBMSSongID ? largestBMSSongID.id + 1 : 1,
			},
		];

		logger.info(`Inserting ${Counters.map((e) => `${e.counterName}: ${e.value}`)}`);

		await db.counters.insert(Counters);

		process.exit(0);
	})();
}
