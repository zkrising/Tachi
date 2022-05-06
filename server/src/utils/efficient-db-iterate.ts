/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import type { ICollection } from "monk";

const logger = CreateLogCtx(__filename);

export async function EfficientDBIterate<T, R>(
	collection: ICollection<T>,
	callbackFn: (c: T) => Promise<R>,
	saveOp: (c: Array<R>) => Promise<void>,
	// eslint-disable-next-line @typescript-eslint/ban-types
	filter: object = {},
	bucketSize = 10_000
) {
	let i = 0;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		logger.info(`Running on ${i} - ${i + bucketSize} documents.`);
		// eslint-disable-next-line no-await-in-loop
		const docs = await collection.find(filter, { limit: bucketSize, skip: i });

		if (docs.length === 0) {
			break;
		}

		const rDocs = await Promise.all(docs.map(callbackFn));

		i = i + bucketSize;

		await saveOp(rDocs);
	}
}
