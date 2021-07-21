import db from "../../src/external/mongo/db";
import { Command } from "commander";
import CreateLogCtx from "../../src/lib/logger/logger";

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-c, --code <code>", "The code for this invite.");

program.parse(process.argv);
const options = program.opts();

db.invites
	.insert({
		code: options.code,
		createdBy: 1,
		consumed: false,
		createdOn: Date.now(),
	})
	.then(() => {
		logger.info(`Created invite ${options.code}.`);
		process.exit(0);
	});
