/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("assert");
const path = require("path");
const fs = require("fs");

assert(process.env.NODE_ENV === "test", "NODE_ENV WAS NOT TEST, BAILING");

// empty the logs.
try {
    fs.rmSync(path.join(__dirname, "../logs/ktblack-tests-error.log"));
    fs.rmSync(path.join(__dirname, "../logs/ktblack-tests.log"));
} catch (err) {
    // no logs to remove, who cares!
}
