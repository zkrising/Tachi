// @todo #118 Investigate why this import triggers a circular dependency according to madge.
import p, { PrudenceError, ValidSchemaValue } from "prudence";

export function FormatPrError(err: PrudenceError, foreword = "Error") {
    const receivedText =
        typeof err.userVal === "object" && err.userVal !== null
            ? ""
            : ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`;

    return `${foreword}: ${err.keychain} | ${err.message}${receivedText}.`;
}

export const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));
