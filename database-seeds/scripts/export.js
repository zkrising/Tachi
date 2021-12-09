const monk = require("monk");
const { Command } = require("commander");
const { StaticConfig } = require("tachi-common");
const logger = require("./logger");
const path = require("path");
const fs = require("fs");
const DeterministicCollectionSort = require("./deterministic-collection-sort");
const { RemoveUnderscoreID } = require("./remove-_id");

const program = new Command();
program
	.option("-c, --connection <127.0.0.1:27017/my_database>")
	.option("-t, --useTabs")
	.option("-a, --all")
	.argument("[collection]");

program.parse(process.argv);
const options = program.opts();

if (!options.connection) {
	throw new Error(`Please specify a database connection string with -c or --connection.`);
}

// This will blow up horrifically if the connection URL is malformed.
// Just don't do that, I guess!
const db = monk(options.connection);

const collectionsDir = path.join(__dirname, "../collections");

const collections = [];

if (options.all) {
	collections.push("folders", "tables");
	collections.push(...StaticConfig.allSupportedGames.map(e => `songs-${e}`));
	collections.push(...StaticConfig.allSupportedGames.map(e => `charts-${e}`));
} else if (program.args[0]) {
	collections.push(program.args[0]);
}

// Add the songs-{game} and charts-{game} collections.



(async () => {
	logger.info(`Exporting ${collections.length} collections.`);

	for (const collection of collections) {
		logger.info(`Exporting ${collection}.`);

		await ExportCollection(collection);
	}

	RemoveUnderscoreID();

	DeterministicCollectionSort();

	logger.info(`Done!`);

	process.exit(0);
})();

async function ExportCollection(collection) {
	const data = await db.get(collection).find({});
	logger.info(`Got ${data.length} documents.`);

	const pt = path.join(collectionsDir, `${collection}.json`);
	fs.writeFileSync(pt, JSON.stringify(data, null, options.useTabs ? "\t" : undefined));

	logger.info(`Wrote to ${pt}.`);
}