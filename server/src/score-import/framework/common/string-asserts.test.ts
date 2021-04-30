import t from "tap";
import { InvalidScoreFailure } from "../importing/converter-failures";
import { AssertStrAsPositiveInt, AssertStrAsPositiveNonZeroInt } from "./string-asserts";

function astr(v: string) {
    try {
        let r = AssertStrAsPositiveInt(v, "err");

        return r;
    } catch (e) {
        return e;
    }
}

function astrp(v: string) {
    try {
        let r = AssertStrAsPositiveNonZeroInt(v, "err");

        return r;
    } catch (e) {
        return e;
    }
}

t.test("#AssertStrAsPositiveInt", (t) => {
    t.strictSame(
        astr("---"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject non-int input"
    );

    t.strictSame(
        astr("1.4"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject float input"
    );

    t.strictSame(
        astr("NaN"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject NaN"
    );
    t.strictSame(
        astr("-0.3"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject negative float input"
    );

    t.strictSame(
        astr("0xFF"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject hex input"
    );

    t.strictSame(
        astr("0b11"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject binary input"
    );

    t.strictSame(
        astr("0o77"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject oct input"
    );

    t.strictSame(
        astr("--1"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject double neg input"
    );

    t.strictSame(
        astr("12f"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject valid parseInt but invalid Number() input"
    );

    t.strictSame(
        astr(`${Number.MAX_SAFE_INTEGER.toString()}000`),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject numbers > max_safe_integer."
    );

    t.strictSame(
        astr("-1"),
        new InvalidScoreFailure(`err (Was negative.)`),
        "Should reject negative integer input"
    );

    t.strictSame(astr("-0"), 0, "Should allow negative 0 input");
    t.strictSame(astr("0"), 0, "Should allow 0 input");
    t.strictSame(astr("13"), 13, "Should allow valid int input");

    t.end();
});

t.test("#AssertStrAsPositiveNonZeroInt", (t) => {
    t.strictSame(
        astrp("---"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject non-int input"
    );

    t.strictSame(
        astrp("1.4"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject float input"
    );

    t.strictSame(
        astrp("NaN"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject NaN"
    );
    t.strictSame(
        astrp("-0.3"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject negative float input"
    );

    t.strictSame(
        astrp("0xFF"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject hex input"
    );

    t.strictSame(
        astrp("0b11"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject binary input"
    );

    t.strictSame(
        astrp("0o77"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject oct input"
    );

    t.strictSame(
        astrp("--1"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject double neg input"
    );

    t.strictSame(
        astrp("12f"),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject valid parseInt but invalid Number() input"
    );

    t.strictSame(
        astrp(`${Number.MAX_SAFE_INTEGER.toString()}000`),
        new InvalidScoreFailure(`err (Not an integer.)`),
        "Should reject numbers > max_safe_integer."
    );

    t.strictSame(
        astrp("-1"),
        new InvalidScoreFailure(`err (Was negative or zero.)`),
        "Should reject negative integer input"
    );

    t.strictSame(
        astrp("-0"),
        new InvalidScoreFailure(`err (Was negative or zero.)`),
        "Should reject negative 0 input"
    );

    t.strictSame(
        astrp("0"),
        new InvalidScoreFailure(`err (Was negative or zero.)`),
        "Should reject 0 input"
    );

    t.strictSame(astrp("13"), 13, "Should allow valid int input");

    t.end();
});
