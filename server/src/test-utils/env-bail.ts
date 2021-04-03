import assert from "assert";

assert(process.env.NODE_ENV === "test", "NODE_ENV WAS NOT TEST, BAILING");
