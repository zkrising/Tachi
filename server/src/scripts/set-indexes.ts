/* eslint-disable no-await-in-loop */
import { SetIndexes } from "../external/mongo/indexes";
import { Command } from "commander";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import { WrapScriptPromise } from "utils/misc";

const program = new Command();

const logger = CreateLogCtx(__filename);

program.option("-d, --db <database>", "The database to index.");
program.option(
	"-r, --reset",
	"Whether to reset all indexes on this database before indexing or not."
);

program.parse(process.argv);
const options: { db: string; reset?: boolean } = program.opts();

if (!options.db) {
	options.db = `${Environment.mongoUrl}/${ServerConfig.MONGO_DATABASE_NAME}`;
}

if (require.main === module) {
	WrapScriptPromise(SetIndexes(options.db, options.reset === true), logger);
}
