// THIS SCRIPT IS NOT FOR IMPORTING TO AN INSTANCE OF TACHI.
// THAT PROCESS IS *SIGNIFICANTLY* MORE COMPLEX, AND IS PART
// OF TACHI-SERVER.

// This script is for importing the collections *immediately* into
// any old mongo instance.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { Command } = require("commander");
const logger = require("./logger");

const program = new Command();

program
	.option("-d, --db <Database Name>")

program.parse(process.argv);
const options = program.opts();

if (!options.db) {
	throw new Error(`Must provide database name with -d or --db.`);
}

const base = path.join(__dirname, "../collections");

for (const file of fs.readdirSync(base)) {
	const filename = path.parse(file).name;
	const fileLoc = path.join(base, file);

	const command = `mongoimport -c=${filename} --jsonArray ${fileLoc} --db=${options.db}`;

	const data = fs.readFileSync(fileLoc, "utf-8");

	if (data === "[]") {
		logger.info(`Skipping collection ${file} as the data is empty.`);
		continue;
	}

	logger.info(`Running ${command}.`);

	try {
		execSync(command, { stdio: "inherit" });
	} catch (err) {
		logger.error(`Failed to import ${file}.`, { command, err });
	}
}