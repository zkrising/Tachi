import { Databases, monkDB } from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { DatabaseSchemas } from "external/mongo/schemas";
import { FormatPrError } from "utils/prudence";

// note: a hell of a lot of this code is copy pasted
// this is just a script, so, feel free to refactor it.

const logger = CreateLogCtx(__filename);

export async function ValidateCollection(collectionName: Databases): Promise<void> {
	const schemaRunner = DatabaseSchemas[collectionName];

	const documents = await monkDB.get(collectionName).count({});

	logger.info(`Validating ${collectionName}. This is ${documents} documents.
	`);
	let success = 0;
	let fails = 0;

	await monkDB
		.get(collectionName)
		.find({})
		// @ts-expect-error faulty monk types
		.each((c) => {
			try {
				schemaRunner(c);
				success++;
			} catch (err) {
				logger.error(`[${collectionName}]: ${FormatPrError(err)}`, c);
				fails++;
			}
		});

	logger.info(`Success: ${success} (${(100 * success) / documents}%)`);
	logger.info(`Failures: ${fails} (${(100 * fails) / documents}%)`);
}

export async function ValidateAllCollections() {
	for (const collectionName in DatabaseSchemas) {
		// eslint-disable-next-line no-await-in-loop
		await ValidateCollection(collectionName as keyof typeof DatabaseSchemas);
	}
}

if (require.main === module) {
	ValidateAllCollections().then(() => process.exit(0));
}
