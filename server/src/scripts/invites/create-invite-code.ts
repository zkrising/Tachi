import { Command } from "commander";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { Random20Hex } from "utils/misc";

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-c, --code <code>", "The code for this invite.");

program.parse(process.argv);
const options = program.opts();

if (options.code === undefined) {
	options.code = Random20Hex();
}

const code = options.code as string;

db.invites
	.insert({
		code,
		createdBy: 1,
		consumed: false,
		createdAt: Date.now(),
		consumedBy: null,
		consumedAt: null,
	})
	.then(() => {
		logger.info(`Created invite ${code}.`, () => {
			process.exit(0);
		});
	})
	.catch((err: unknown) => {
		logger.error(`Failed to create invite ${code}`, { err }, () => {
			process.exit(1);
		});
	});
