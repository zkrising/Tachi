import chalk from "chalk";
import { Game } from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";
import { SCHEMAS } from "tachi-common/lib/schemas";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";
import get from "lodash.get";
import fjsh from "fast-json-stable-hash";

// Either it's a bare string or an array of strings for co-uniqueness.
type DuplicateKeyDecl = string | string[];

// @ts-expect-error filled out dynamically.
const SongChartKeys: Record<`${"song" | "chart"}s-${Game}`, DuplicateKeyDecl[]> = {};

for (const game of allSupportedGames) {
	// temporary hack
	if (game === "ddr" || game === "gitadora") {
		continue;
	}

	SongChartKeys[`songs-${game}`] = ["id"];
	SongChartKeys[`charts-${game}`] = [
		"chartID",
		// @todo THIS IS WRONG. CHARTS ARE ALLOWED TO HAVE MULTIPLE
		// SONGID+PLAYTYPE+DIFFICULTY COMBOS IF ISPRIMARY IS FALSE.
		["songID", "playtype", "difficulty", "isPrimary"],
	];
}

const UniqueKeys: Partial<Record<keyof typeof SCHEMAS, DuplicateKeyDecl[]>> = {
	"bms-course-lookup": ["md5sums"],
	folders: ["folderID"],
	tables: ["tableID"],
	...SongChartKeys,
};

UniqueKeys["charts-iidx"].push("data.arcChartID");

UniqueKeys["charts-usc"].push(["data.hashSHA1", "playtype"]);

UniqueKeys["charts-popn"].push("data.hashSHA256");

UniqueKeys["charts-bms"].push("data.hashMD5");
UniqueKeys["charts-bms"].push("data.hashSHA256");

UniqueKeys["charts-pms"].push(["data.hashMD5", "playtype"]);
UniqueKeys["charts-pms"].push(["data.hashSHA256", "playtype"]);

UniqueKeys["charts-itg"].push("data.chartHash");

let exitCode = 0;
const suites = [];

for (const [collection, uniqueIDs] of Object.entries(UniqueKeys)) {
	console.log(`[VALIDATING DUPES] ${collection}`);

	const collectionName = `${collection}.json`;
	const formatFn = FormatFunctions[collection];

	let success = 0;
	let fails = 0;

	const data = ReadCollection(collectionName);

	let game = "";

	if (collection.startsWith("songs-") || collection.startsWith("charts-")) {
		game = collection.split("-")[1];
	}

	for (const uniqueID of uniqueIDs) {
		const set = new Set<string>();

		for (const d of data) {
			const pretty = formatFn(d, game);

			let pureValue: string;
			let value: string;

			if (Array.isArray(uniqueID)) {
				const mappedProps = uniqueID.map((e) => get(d, e));

				pureValue = mappedProps.join(", ");
				value = fjsh.hash(mappedProps, "sha256");
			} else {
				value = get(d, uniqueID);
				pureValue = value;
			}

			// Null is special -- we're allowed duplicates of null for some
			// keys.
			if (set.has(value) && !(uniqueID === "data.arcChartID" && value === null)) {
				console.error(
					chalk.red(
						`[ERR] ${collectionName} | ${pretty} | Is duplicate on ${uniqueID}:${pureValue}.}.`
					)
				);
				fails++;
			} else {
				success++;
				set.add(value);
			}
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
