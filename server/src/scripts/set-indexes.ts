/* eslint-disable no-await-in-loop */
import { SetIndexes } from "../external/mongo/indexes";
import { Command } from "commander";
import CreateLogCtx from "lib/logger/logger";

const program = new Command();

const logger = CreateLogCtx(__filename);

program.requiredOption("-d, --db <database>", "The database to index.");
program.option(
	"-r, --reset",
	"Whether to reset all indexes on this database before indexing or not."
);

program.parse(process.argv);
const options: { db: string; reset?: boolean } = program.opts();

SetIndexes(options.db, options.reset === true)
	.then(() => process.exit(0))
	.catch((err: unknown) => {
		logger.error(`Failed to set indexes.`, { err }, () => {
			process.exit(1);
		});
	});
