import crypto from "crypto";

// https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
// the developer of this has migrated everything to Force ES6 style modules,
// which really really messes with a lot of the ecosystem.
// shim.

export function EscapeStringRegexp(string: string) {
    if (typeof string !== "string") {
        throw new TypeError("Expected a string");
    }

    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it's always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns' stricter grammar.
    return string.replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&").replace(/-/gu, "\\x2d");
}

/**
 * Takes a process.hrtime.bigint(), and returns the miliseconds elapsed since it.
 * This function will not work if more than 100(ish) days have passed since the first reference.
 */
export function GetMilisecondsSince(ref: bigint) {
    return Number(process.hrtime.bigint() - ref) / 1e6;
}

export function Random20Hex() {
    return crypto.randomBytes(20).toString("hex");
}

export function MStoS(ms: number) {
    return Math.floor(ms / 1000);
}
