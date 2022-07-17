import chalk from "chalk";
import fs from "fs";
import path from "path";
import { SCHEMAS } from "tachi-common/lib/schemas";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

function FormatPrError(err, foreword = "Error") {
	const receivedText =
		typeof err.userVal === "object" && err.userVal !== null
			? ""
			: ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`;

	return `${foreword}: ${err.keychain} | ${err.message}${receivedText}.`;
}

let exitCode = 0;
const suites: Array<{ name: string; good: boolean; report: unknown }> = [];

const collections = fs
	.readdirSync(path.join(__dirname, "../../collections"))
	.map((e) => path.basename(e).replace(/\.json$/u, ""));

for (const collection of collections) {
	console.log(`[VALIDATING] ${collection}`);

	let success = 0;
	let fails = 0;

	const collectionName = `${collection}.json`;
	const formatFn = FormatFunctions[collection];

	const data = ReadCollection(collectionName, true);

	const validator = SCHEMAS[collection];

	let game = "";

	if (collection.startsWith("songs-") || collection.startsWith("charts-")) {
		const maybeGame = collection.split("-")[1];

		if (maybeGame === undefined) {
			throw new Error(`Collection passed was literally ${collection}, why?`);
		}

		game = maybeGame;
	}

	for (const d of data) {
		// Will throw if formatFn is undefined -- that's a test failure in my book.
		const pretty = formatFn(d, game);

		try {
			validator(d);

			success++;
		} catch (err) {
			console.error(
				chalk.red(`[ERR] ${collectionName} | ${pretty} | ${FormatPrError(err)}.`)
			);
			fails++;
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
	console.log(chalk[suite.good ? "green" : "red"](`[SCHEMAS] ${suite.name}: ${suite.report}`));
}

process.exit(exitCode);
