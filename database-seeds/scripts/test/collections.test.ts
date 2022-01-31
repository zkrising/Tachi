import chalk from "chalk";
import { writeFileSync } from "fs";
import { ReadCollection } from "../util";
import { SCHEMAS } from "./schemas";

function FormatPrError(err, foreword = "Error") {
	const receivedText =
		typeof err.userVal === "object" && err.userVal !== null
			? ""
			: ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`;

	return `${foreword}: ${err.keychain} | ${err.message}${receivedText}.`;
}

const songFormat = (s) => `${s.artist} - ${s.title} (${s.id})`;
const chartFormat = (s) => `${s.id} - ${s.playtype} ${s.difficulty} (${s.chartID})`;

const FormatFunctions: Record<keyof typeof SCHEMAS, (d) => string> = {
	"bms-course-lookup": (d) => d.title,
	folders: (d) => d.title,
	tables: (d) => d.name,
	"songs-bms": songFormat,
	"songs-chunithm": songFormat,
	// "songs-ddr": songFormat,
	// "songs-gitadora": songFormat,
	"songs-iidx": songFormat,
	"songs-jubeat": songFormat,
	// "songs-maimai": songFormat,
	"songs-museca": songFormat,
	"songs-pms": songFormat,
	"songs-popn": songFormat,
	"songs-sdvx": songFormat,
	"songs-usc": songFormat,
	"songs-wacca": songFormat,
	"charts-bms": chartFormat,
	"charts-chunithm": chartFormat,
	// "charts-ddr": chartFormat,
	// "charts-gitadora": chartFormat,
	"charts-iidx": chartFormat,
	"charts-jubeat": chartFormat,
	// "charts-maimai": chartFormat,
	"charts-museca": chartFormat,
	"charts-pms": chartFormat,
	"charts-popn": chartFormat,
	"charts-sdvx": chartFormat,
	"charts-usc": chartFormat,
	"charts-wacca": chartFormat,
};

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
	console.log(chalk[suite.good ? "green" : "red"](`${suite.name}: ${suite.report}`));
}

process.exit(exitCode);
