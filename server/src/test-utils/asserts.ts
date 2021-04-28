import Prudence, { PrudenceSchema } from "prudence";
import t from "tap";

export function isApproximately(number: number, target: number, message: string, lenience = 0.01) {
    let result = t.ok(Math.abs(number - target) < lenience, message);

    if (!result) {
        throw new Error(`${number} was not close enough to ${target}`);
    }

    return true;
}

export function prAssert(
    obj: Record<string, unknown> | unknown,
    schema: PrudenceSchema,
    message = "Unnamed Prudence Assertion"
) {
    let err = Prudence(obj, schema);

    if (err) {
        return t.fail(message, err);
    }

    return t.pass(message);
}
