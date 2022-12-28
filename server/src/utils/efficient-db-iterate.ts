/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import type { ICollection, IObjectID } from "monk";

const logger = CreateLogCtx(__filename);

export async function EfficientDBIterate<T, R>(
	collection: ICollection<T>,
	callbackFn: (c: T) => Promise<R> | R,
	saveOp: (c: Array<R>) => Promise<void>,
	// eslint-disable-next-line @typescript-eslint/ban-types
	filter: object = {},
	bucketSize = 10_000
) {
	let i = 0;

	let lastID: IObjectID | null = null;

	while (true) {
		logger.info(`Running on ${i} - ${i + bucketSize} documents.`);
		// eslint-disable-next-line no-await-in-loop
		const newFilter: any = { ...filter };

		if (lastID) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			newFilter._id = { $gt: lastID };
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const docs = await collection.find(newFilter, {
			sort: { _id: 1 },
			limit: bucketSize,
			projectID: true,
		});

		if (docs.length === 0) {
			logger.info(`Ended documents at ${i}.`);
			break;
		}

		const rDocs = await Promise.all(docs.map(callbackFn));

		i = i + bucketSize;

		// update lastID by taking the last document's ID.
		lastID = docs.at(-1)?._id ?? null;

		await saveOp(rDocs);
	}
}
