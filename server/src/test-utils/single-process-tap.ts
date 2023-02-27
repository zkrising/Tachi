/* eslint-disable import/first */
// see: https://www.npmjs.com/package/fix-esm
// fzf *mandates* esm, but we don't use it (ts transpiles to cjs)
// sick of this headache.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
require("fix-esm").register();

import "external/mongo/db";
import { CleanUpAfterTests } from "./cleanup";
import glob from "glob";
import t from "tap";
import path from "path";

const files = glob.sync(path.join(__dirname, "../", "**/*.test.ts"));

process.env.NODE_PATH = path.join(__dirname, "../");

for (const file of files) {
	// Deliberate -- we're doing hackery here.
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require(file);
}

t.teardown(CleanUpAfterTests);
