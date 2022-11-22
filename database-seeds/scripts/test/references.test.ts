// test that things point to things that actually exist, i.e. no chart-song desync
// and no quest-goal desync, etc.

import chalk from "chalk";
import { Game } from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

interface ReferenceCheck {
	base: string;
	parent: string;
	baseKey: string | ((d: any) => Array<string>);
	parentKey: string | ((d: any) => Array<string>);
	game: Game | null;
}

const refChecks: Array<ReferenceCheck> = [
	...allSupportedGames.map((game) => ({
		base: `charts-${game}`,
		parent: `songs-${game}`,
		baseKey: "songID",
		parentKey: "id",
		game,
	})),
	{
		base: "quests",
		baseKey: (quest) => quest.questData.flatMap((e) => e.goals.map((e) => e.goalID)),
		parent: "goals",
		parentKey: "goalID",
		game: null,
	},
	{
		base: "tables",
		baseKey: (table) => table.folders,
		parent: "folders",
		parentKey: "folderID",
		game: null,
	},
];

let exitCode = 0;
const suites: Array<{ name: string; good: boolean; report: unknown }> = [];

for (const refCheck of refChecks) {
	const name = `${refCheck.base}::${refCheck.parent}`;

	console.log(`[VALIDATING REFS] ${refCheck.base}::${refCheck.parent}`);

	let success = 0;
	let fails = 0;

	const baseData = ReadCollection(`${refCheck.base}.json`, true);
	const parentData = ReadCollection(`${refCheck.parent}.json`, true);

	const ids = new Set<string>(
		parentData.flatMap((e) => {
			if (typeof refCheck.parentKey === "string") {
				return e[refCheck.parentKey];
			}

			return refCheck.parentKey(e);
		})
	);

	const formatFn = FormatFunctions[refCheck.base];

	for (const data of baseData) {
		const keys: Array<string> = [];

		const pretty = formatFn(data, refCheck.game);

		if (typeof refCheck.baseKey === "string") {
			keys.push(data[refCheck.baseKey]);
		} else {
			keys.push(...refCheck.baseKey(data));
		}

		for (const key of keys) {
			if (!ids.has(key)) {
				console.error(
					chalk.red(
						`[REF-ERR] ${name} | ${pretty} | Made reference to ID ${key}, but this did not exist in the parent collection.`
					)
				);
				fails++;
			} else {
				success++;
			}
		}
	}

	const report = `GOOD: ${success}, BAD: ${fails}(${Math.min(
		(success * 100) / fails,
		100
	).toFixed(2)}%)`;
	if (fails > 0) {
		console.error(chalk.red(`[REF-FAILED] ${name}. ${report}.`));
		exitCode++;
	} else {
		console.log(chalk.green(`[REF-GOOD] ${name}. ${report}.`));
	}

	suites.push({ name, report, good: fails === 0 });
}

console.log(`=== Suite Overview ===`);
for (const suite of suites) {
	console.log(chalk[suite.good ? "green" : "red"](`[REF] ${suite.name}: ${suite.report}`));
}

process.exit(exitCode);
