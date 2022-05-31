import Prudence from "prudence";
import type { PrudenceSchema } from "prudence";

export function isApproximately(
	t: Tap.Test,
	number: number,
	target: number,
	message?: string,
	lenience = 0.01
) {
	const result = Math.abs(number - target) < lenience;

	if (!result) {
		return t.fail(`${number} was not close enough to ${target}`, {
			errmsg: `${number} was not close enough to ${target}`,
		});
	}

	t.pass(message);

	// return true;
}

export function prAssert(
	t: Tap.Test,
	obj: unknown,
	schema: PrudenceSchema,
	message = "Unnamed Prudence Assertion"
) {
	const err = Prudence(obj, schema);

	if (err) {
		return t.fail(message, err);
	}

	return t.pass(message);
}
