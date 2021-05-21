// @todo #118 Investigate why this import triggers a circular dependency according to madge.
import p, { PrudenceError, ValidSchemaValue } from "prudence";

export function FormatPrError(err: PrudenceError, foreword = "Error") {
    return `${foreword}: ${err.keychain} | ${err.message}${
        typeof err.userVal === "object" && err.userVal !== null
            ? ""
            : ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`
    }.`;
}

export const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));
