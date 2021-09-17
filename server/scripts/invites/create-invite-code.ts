import db from "external/mongo/db";
import { Command } from "commander";
import CreateLogCtx from "lib/logger/logger";
import { Random20Hex } from "utils/misc";

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-c, --code <code>", "The code for this invite.");

program.parse(process.argv);
const options = program.opts();

if (!options.code) {
	options.code = Random20Hex();
}

db.invites
	.insert({
		code: options.code,
		createdBy: 1,
		consumed: false,
		createdAt: Date.now(),
		consumedBy: null,
		consumedAt: null,
	})
	.then(() => {
		logger.info(`Created invite ${options.code}.`);
		process.exit(0);
	});
