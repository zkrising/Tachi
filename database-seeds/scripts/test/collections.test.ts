import chalk from "chalk";
import { ReadCollection } from "../util";
import { SCHEMAS } from "./schemas";
import { FormatFunctions } from "./test-utils";

function FormatPrError(err, foreword = "Error") {
	const receivedText =
		typeof err.userVal === "object" && err.userVal !== null
			? ""
			: ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`;

	return `${foreword}: ${err.keychain} | ${err.message}${receivedText}.`;
}

let exitCode = 0;
const suites = [];

for (const [collection, validator] of Object.entries(SCHEMAS)) {
	console.log(`[VALIDATING] ${collection}`);

	let success = 0;
	let fails = 0;

	const collectionName = `${collection}.json`;
	const formatFn = FormatFunctions[collection];

	const data = ReadCollection(collectionName, true);

	for (const d of data) {
		const pretty = formatFn(d);

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
	console.log(
		chalk[suite.good ? "green" : "red"](
			`${suite.name}: ${suite.report} (Objects here don't match the schema.)`
		)
	);
}

process.exit(exitCode);
