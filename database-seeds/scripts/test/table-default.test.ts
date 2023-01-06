import chalk from "chalk";
import { FormatGame, TableDocument } from "tachi-common";
import { allGPTString } from "tachi-common/config/static-config";
import { ReadCollection } from "../util";

const gptStringMap = {};

const tables: Array<TableDocument> = ReadCollection("tables.json");

let errs = 0;

for (const t of tables) {
	if (t.default && t.inactive) {
		console.log(
			chalk.red(
				`[TABLE-DEFAULT] The default table for ${FormatGame(t.game, t.playtype)} '${
					t.title
				}' is inactive. This is not legal.`
			)
		);
		errs += 1;
	}

	if (t.default) {
		const gptString = `${t.game}:${t.playtype}`;
		if (gptStringMap[gptString]) {
			console.log(
				chalk.red(
					`[TABLE-DEFAULT] There are multiple default tables for ${FormatGame(
						t.game,
						t.playtype
					)}. This is not legal.`
				)
			);
		}

		gptStringMap[gptString] = true;
	}
}

for (const gptString of allGPTString) {
	if (!gptStringMap[gptString]) {
		console.log(chalk.red(`[TABLE-DEFAULT] There is no default table for ${gptString}.`));
		errs += 1;
	}
}

if (errs === 0) {
	process.exit(0);
} else {
	process.exit(1);
}
