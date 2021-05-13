// https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
// the developer of this has migrated everything to Force ES6 style modules,
// which really really messes with a lot of the ecosystem.
// shim.

export default function escapeStringRegexp(string: string) {
    if (typeof string !== "string") {
        throw new TypeError("Expected a string");
    }

    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it's always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns' stricter grammar.
    return string.replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&").replace(/-/gu, "\\x2d");
}
