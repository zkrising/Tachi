const monk = require("monk");
const { Command } = require("commander");
const { StaticConfig } = require("tachi-common");
const logger = require("./logger");
const path = require("path");
const fs = require("fs");

const program = new Command();
program
	.option("-c, --connection <127.0.0.1:27017/my_database>")
	.option("-t, --useTabs");

program.parse(process.argv);
const options = program.opts();

if (!options.connection) {
	throw new Error(`Please specify a database connection string with -c or --connection.`);
}

// This will blow up horrifically if the connection URL is malformed.
// Just don't do that, I guess!
const db = monk(options.connection);

const collectionsDir = path.join(__dirname, "../collections");

const collections = [
	"folders",
	"tables",
];

// Add the songs-{game} and charts-{game} collections.

collections.push(...StaticConfig.allSupportedGames.map(e => `songs-${e}`));
collections.push(...StaticConfig.allSupportedGames.map(e => `charts-${e}`));

(async () => {
	logger.info(`Exporting ${collections.length} collections.`);

	for (const collection of collections) {
		logger.info(`Exporting ${collection}.`);

		const data = await db.get(collection).find({});
		logger.info(`Got ${data.length} documents.`);

		const pt = path.join(collectionsDir, `${collection}.json`);
		fs.writeFileSync(pt, JSON.stringify(data, null, options.useTabs ? "\t" : undefined));

		logger.info(`Wrote to ${pt}.`);
	}

	logger.info(`Done!`);

	process.exit(0);
})();
