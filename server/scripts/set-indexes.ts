/* eslint-disable no-await-in-loop */
import { Command } from "commander";
import { SetIndexes } from "../src/external/mongo/indexes";

const program = new Command();

program.option("-d, --db <database>", "The database to index.");
program.option(
	"-r, --reset",
	"Whether to reset all indexes on this database before indexing or not."
);

program.parse(process.argv);
const options = program.opts();

SetIndexes(options.db, options.reset).then(() => process.exit(0));
