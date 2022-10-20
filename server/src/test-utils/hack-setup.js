// This runs as JS because of https://github.com/tapjs/node-tap/issues/761

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");
const path = require("path");

const assert = require("assert");

assert(process.env.NODE_ENV === "test", "NODE_ENV WAS NOT TEST, BAILING");
execSync(`pnpm ts-node ${path.join(__dirname, "./setup.ts")}`, { stdio: "inherit" });
