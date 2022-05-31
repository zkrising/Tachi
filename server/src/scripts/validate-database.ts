// note: a hell of a lot of this code is copy pasted
// this is just a script, so, feel free to refactor it.
import { Command } from "commander";
import { monkDB } from "external/mongo/db";
import { DatabaseSchemas } from "external/mongo/schemas";
import CreateLogCtx from "lib/logger/logger";
import { FormatPrError } from "utils/prudence";
import type { Databases } from "external/mongo/db";
import type { FindResult } from "monk";
import type { PrudenceError } from "prudence";

const program = new Command();

program.option("-c, --collection <collectionName>");

program.parse(process.argv);
const options = program.opts();

const logger = CreateLogCtx(__filename);

export async function ValidateCollection(collectionName: Databases): Promise<void> {
	if (!(collectionName in DatabaseSchemas)) {
		logger.verbose(`Skipping ${collectionName} as it has no schema.`);
		return;
	}

	// collectionName is in database schemas.
	const schemaRunner = DatabaseSchemas[collectionName];

	const documents = await monkDB.get(collectionName).count({});

	logger.info(`Validating ${collectionName}. This is ${documents} documents.
	`);
	let success = 0;
	let fails = 0;

	// Faulty monk types. Returns actually also have a streaming .each operator
	// which we leverage here for performance.
	await (
		monkDB.get(collectionName).find({}) as Promise<FindResult<unknown>> & {
			each: (cb: (c: unknown) => void) => Promise<void>;
		}
	).each((c) => {
		try {
			schemaRunner(c);
			success++;
		} catch (err) {
			logger.error(`[${collectionName}]: ${FormatPrError(err as PrudenceError)}`, c);
			fails++;
		}
	});

	logger.info(`Success: ${success} (${(100 * success) / documents}%)`);
	logger.info(`Failures: ${fails} (${(100 * fails) / documents}%)`);
}

export async function ValidateAllCollections() {
	for (const collectionName of Object.keys(DatabaseSchemas)) {
		// eslint-disable-next-line no-await-in-loop
		await ValidateCollection(collectionName as keyof typeof DatabaseSchemas);
	}
}

if (require.main === module) {
	if (typeof options.collection === "string") {
		// @hack This should be typechecked and warned about outside of ValidateCollection.
		ValidateCollection(options.collection as Databases)
			.then(() => process.exit(0))
			.catch((err: unknown) => {
				logger.error(`Failed to validate collection ${options.collection}?`, { err });
				process.exit(1);
			});
	} else {
		ValidateAllCollections()
			.then(() => process.exit(0))
			.catch((err: unknown) => {
				logger.error(`Failed to validate all collections?`, { err });
				process.exit(1);
			});
	}
}
