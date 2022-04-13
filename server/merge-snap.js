const fs = require("fs");

// This script takes a path to a .test.ts file, finds its equivalent snapshot file
// and merges it with single-process-tap's snapshot file.

const toMerge = process.argv[2];

if (!toMerge) {
	throw new Error("no argv passed to merge-snap. Can't merge with nothing.");
}

const BASE_FILE = "./tap-snapshots/src/test-utils/single-process-tap.ts.test.cjs";
const NEW_FILE = `${toMerge.replace("tachi-server/src", "tachi-server/tap-snapshots/src")}.test.cjs`;

const baseSet = require(BASE_FILE);

const newSet = require(NEW_FILE);

for (const [snapshotName, snapshotValue] of Object.entries(newSet)) {
	baseSet[snapshotName] = snapshotValue;
}


function escapeBacktickString(str) {
	return str.replace(/\`\$/, " ")
}

const cases = [];

for (const [snapshotName, snapshotValue] of Object.entries(baseSet)) {
	cases.push(`exports[\`${escapeBacktickString(snapshotName)}\`] = \`${escapeBacktickString(snapshotValue)}\`\n`)
}

let outFile = `
/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
${cases.join("\n")}`

fs.writeFileSync(BASE_FILE, outFile);
fs.rmSync(NEW_FILE);