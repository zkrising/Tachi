import Prudence, { PrudenceSchema } from "prudence";
import t from "tap";

export default function prAssert(
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
