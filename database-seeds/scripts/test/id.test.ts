import chalk from "chalk";
import { Game, integer } from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";
import { SCHEMAS } from "tachi-common/lib/schemas";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";
import get from "lodash.get";
import fjsh from "fast-json-stable-hash";
import logger from "../logger";

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
	"bms-course-lookup": [["set", "playtype", "value"]],
	folders: ["folderID"],
	tables: ["tableID"],
	...SongChartKeys,
};

UniqueKeys["charts-iidx"]!.push("data.arcChartID");

UniqueKeys["charts-usc"]!.push(["data.hashSHA1", "playtype"]);

UniqueKeys["charts-popn"]!.push("data.hashSHA256");

UniqueKeys["charts-bms"]!.push("data.hashMD5");
UniqueKeys["charts-bms"]!.push("data.hashSHA256");

UniqueKeys["charts-pms"]!.push(["data.hashMD5", "playtype"]);
UniqueKeys["charts-pms"]!.push(["data.hashSHA256", "playtype"]);

UniqueKeys["charts-itg"]!.push("data.chartHash");

let exitCode = 0;
const suites: Array<{ name: string; good: boolean; report: unknown }> = [];

/**
 * Turns [[A B], [C], [D E]] into
 * [A C D], [A C E], [B C D], [B C E]
 *
 * https://github.com/izaakschroeder/cartesian-product/blob/master/lib/product.js
 */
function cartesianProduct(elements: Array<Array<unknown>>) {
	const end = elements.length - 1;
	const result: Array<Array<unknown>> = [];

	function addTo(curr: Array<unknown>, start: integer) {
		const first = elements[start]!;
		const last = start === end;

		for (let i = 0; i < first.length; ++i) {
			const copy = curr.slice();
			copy.push(first[i]);

			if (last) {
				result.push(copy);
			} else {
				addTo(copy, start + 1);
			}
		}
	}

	if (elements.length > 0) {
		addTo([], 0);
	} else {
		result.push([]);
	}

	return result;
}

for (const [collection, uniqueIDs] of Object.entries(UniqueKeys)) {
	console.log(`[VALIDATING DUPES] ${collection}`);

	const collectionName = `${collection}.json`;
	const formatFn = FormatFunctions[collection];

	let success = 0;
	let fails = 0;

	const data = ReadCollection(collectionName);

	let game = "";

	if (collection.startsWith("songs-") || collection.startsWith("charts-")) {
		const maybeGame = collection.split("-")[1];

		if (maybeGame === undefined) {
			throw new Error(`You passed ${collection} as a collection. Why?`);
		}

		game = maybeGame;
	}

	for (const uniqueID of uniqueIDs) {
		const set = new Set<string>();

		for (const d of data) {
			const pretty = formatFn(d, game);

			let value: Array<Array<string | number>>;

			// insane parallelisation code
			if (Array.isArray(uniqueID)) {
				const mappedProps = uniqueID.map((e) => get(d, e));

				value = mappedProps;
			} else {
				value = [get(d, uniqueID)];
			}

			// cartesian product values before we interact with them.
			const values = cartesianProduct(value.map((e) => (Array.isArray(e) ? e : [e]))).map(
				(e) => ({
					value: fjsh.hash(e, "sha256"),
					humanisedValue: e.map((e) => String(e)).join(", "),
				})
			);

			for (const { value, humanisedValue } of values) {
				// Null is special -- we're allowed duplicates of null for some
				// keys.
				if (
					set.has(value) &&
					// value is not null, and uniqueID isn't data.arcChartID
					// this is because there may be dupes on data.arcChartID: null.
					// sparse index, zzz.
					!(uniqueID === "data.arcChartID" && humanisedValue === "null")
				) {
					console.error(
						chalk.red(
							`[ERR] ${collectionName} | ${pretty} | Is duplicate on ${uniqueID}:${humanisedValue}.`
						)
					);
					fails++;
				} else {
					success++;
					set.add(value);
				}
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
