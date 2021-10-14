import fs from "fs";
import path from "path";

import { Command } from "commander";

const program = new Command();
program.option("-d, --dir <dir>");

program.parse(process.argv);
const options = program.opts();

if (!options.dir) {
	throw new Error(`No dir provided, yet one is necessary.`);
}

fs.mkdirSync("users/banner", { recursive: true });
fs.mkdirSync("users/pfp", { recursive: true });

for (const file of fs.readdirSync(options.dir)) {
	const dfile = path.join(options.dir, file);
	if (file.endsWith("-banner.png")) {
		fs.copyFileSync(dfile, `users/banner/${file.split("-banner.png")[0]}`);
	} else {
		fs.copyFileSync(dfile, `users/pfp/${file.split("-pfp.png")[0]}`);
	}
}
