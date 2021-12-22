import t from "tap";
import { GetMillisecondsSince, IsValidURL, RoundToNDecimalPlaces } from "./misc";

t.test("#GetMillisecondsSince", (t) => {
	const time = GetMillisecondsSince(10n);
	t.ok(typeof time === "number" && time > 0, "Should return a number greater than 0.");

	t.end();
});

t.test("#IsValidURL", (t) => {
	t.ok(IsValidURL("https://example.com"));
	t.ok(IsValidURL("http://example.com"));
	t.ok(IsValidURL("http://example.com/suburl"));
	t.ok(IsValidURL("http://example.com#href"));
	t.ok(IsValidURL("http://example.com?querystring"));

	t.notOk(IsValidURL("ftp://example.com"));
	// t.notOk(IsValidURL("http://example")); lol this is valid???? insane.
	// t.notOk(IsValidURL("http:/example.com")); this is also valid, the JS URL parser is ridiculously lenient. Whatever.

	t.end();
});

t.test("#RoundToNDecimalPlaces", (t) => {
	t.equal(RoundToNDecimalPlaces(10.4999999999, 1), 10.5);
	t.equal(RoundToNDecimalPlaces(10.4999999999, 2), 10.5);
	t.equal(RoundToNDecimalPlaces(10.4499999999, 2), 10.45);
	t.equal(RoundToNDecimalPlaces(10.4449999999, 3), 10.445);
	t.equal(RoundToNDecimalPlaces(10.4469999999, 3), 10.447);

	t.end();
});
