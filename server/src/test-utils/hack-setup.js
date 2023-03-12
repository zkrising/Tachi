// This runs as JS because of https://github.com/tapjs/node-tap/issues/761

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");
const path = require("path");

const assert = require("assert");

console.log(`Hit HACK_SETUP.js @ ${Date.now()}.`);

assert(process.env.NODE_ENV === "test", "NODE_ENV WAS NOT TEST, BAILING");
execSync(`ts-node ${path.join(__dirname, "./setup.ts")}`, { stdio: "inherit" });
