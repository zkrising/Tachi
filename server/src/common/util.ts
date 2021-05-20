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

export function ParseEA3SoftID(ver: string) {
    const a = ver.split(":");

    if (a.length !== 5) {
        throw new Error(`Invalid Version Code. Had ${a.length} components.`);
    }

    if (!ver.match(/^[A-Z0-9]{3}:[A-Z]:[A-Z]:[A-Z]:[0-9]{10}$/u)) {
        throw new Error(`Invalid Version Code.`);
    }

    return {
        model: a[0],
        dest: a[1], // region
        spec: a[2],
        rev: a[3],
        ext: a[4],
    };
}

/**
 * Takes a process.hrtime.bigint(), and returns the miliseconds elapsed since it.
 * This function will not work if more than 100(ish) days have passed since the first reference.
 */
export function GetMilisecondsSince(ref: bigint) {
    return Number(process.hrtime.bigint() - ref) / 1e6;
}
