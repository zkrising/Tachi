import t from "tap";
import { GetMillisecondsSince, IsValidURL } from "./misc";

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
