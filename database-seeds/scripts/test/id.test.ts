import chalk from "chalk";
import { Game } from "tachi-common";
import { allSupportedGames } from "tachi-common/js/config/static-config";
import { SCHEMAS } from "tachi-common/js/lib/schemas";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

// @ts-expect-error filled out dynamically.
const SongChartKeys: Record<`${"song" | "chart"}s-${Game}`, string> = {};

for (const game of allSupportedGames) {
	// temporary hack
	if (game === "ddr" || game === "gitadora") {
		continue;
	}

	SongChartKeys[`songs-${game}`] = "id";
	SongChartKeys[`charts-${game}`] = "chartID";
}

const UniqueKeys: Partial<Record<keyof typeof SCHEMAS, string>> = {
	"bms-course-lookup": "md5sums",
	folders: "folderID",
	tables: "tableID",
	...SongChartKeys,
};

let exitCode = 0;
const suites = [];

for (const [collection, uniqueID] of Object.entries(UniqueKeys)) {
	console.log(`[VALIDATING DUPES] ${collection}`);

	const collectionName = `${collection}.json`;
	const formatFn = FormatFunctions[collection];

	let success = 0;
	let fails = 0;

	const data = ReadCollection(collectionName);

	const set = new Set<string>();

	for (const d of data) {
		const pretty = formatFn(d);

		const value = d[uniqueID];

		if (set.has(value)) {
			console.error(
				chalk.red(
					`[ERR] ${collectionName} | ${pretty} | Is duplicate on ${uniqueID}:${value}.}.`
				)
			);
			fails++;
		} else {
			success++;
			set.add(value);
		}
	}

	const report = `GOOD: ${success}, BAD: ${fails}(${Math.min(
		(success * 100) / fails,
		100
	).toFixed(2)}%)`;
	if (fails > 0) {
		console.error(chalk.red(`[FAILED] ${collection}. ${report}.`));
		exitCode++;
	} else {
		console.log(chalk.green(`[GOOD] ${collection}. ${report}.`));
	}

	suites.push({ name: collection, report, good: fails === 0 });
}

console.log(`=== Suite Overview ===`);
for (const suite of suites) {
	console.log(chalk[suite.good ? "green" : "red"](`[DUPES] ${suite.name}: ${suite.report}`));
}

process.exit(exitCode);
