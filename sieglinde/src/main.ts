import logger from "./logger";
import fs from "fs";
import { Command } from "commander";
import SieglindeV0Calc from "./calc/v0";
import GetTableData from "./fetch-tables";

if (require.main !== module) {
	logger.error(`The script main.ts must be invoked directly!`);
	process.exit(-1);
}

const program = new Command();
program
	.option("-v, --version <The Sieglinde Version to calculate>")
	.option("-o, --out <Where to output JSON>");

program.parse(process.argv);
const options = program.opts();

if (!options.out) {
	logger.error(`Need to provide an --out parameter for output!`);
	process.exit(-1);
}

const version = Number(options.version) ?? 0;

function WriteOut(data: string) {
	fs.writeFileSync(options.out, data);
}

(async () => {
	if (version === 0) {
		const tableInfo = await GetTableData();

		logger.info(`Starting...`);

		const calcData = await Promise.all(tableInfo.map(SieglindeV0Calc));

		WriteOut(JSON.stringify(calcData));

		logger.info(`Finished!`);
	} else {
		logger.error(`Unsupported/Unknown version ${version}.`);
		process.exit(-1);
	}
})();
