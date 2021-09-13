import CreateLogCtx from "lib/logger/logger";
import { ICollection } from "monk";
import { oldKTDB } from "./old-db";

const logger = CreateLogCtx(__filename);

export default async function MigrateRecords(
	existingCollection: ICollection,
	collectionName: string,
	HandlerFN: (c: unknown) => unknown,
	filter: Record<string, any> = {},
	force = false
) {
	const existingRecords = await existingCollection.count({});
	logger.info(`Starting migration for ${collectionName}...`);

	if (existingRecords > 0) {
		if (force) {
			logger.warn(
				`Forcing migration of documents - appending to ${existingRecords} existing records.`
			);
		} else {
			logger.error(`${existingRecords} documents already exist in db, terminating.`);
			process.exit(1);
		}
	}

	let i = 0;
	const bucketSize = 10_000;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const docs = await oldKTDB.get(collectionName).find(filter, { limit: bucketSize, skip: i });

		logger.info(`Migrating ${i} - ${i + docs.length} documents.`);

		if (docs.length === 0) {
			break;
		}

		// eslint-disable-next-line no-await-in-loop
		const newDocs = await Promise.all(docs.map(HandlerFN));

		i += bucketSize;

		const notNulls = newDocs.filter((e) => e !== null);

		logger.info(`Success: ${notNulls.length}, Failures: ${newDocs.length - notNulls.length}.`);

		// eslint-disable-next-line no-await-in-loop
		await existingCollection.insert(notNulls);

		logger.info(`Migrated ${docs.length} documents.`);

		if (docs.length < bucketSize) {
			break;
		}
	}

	logger.info(`Done!`);
}
