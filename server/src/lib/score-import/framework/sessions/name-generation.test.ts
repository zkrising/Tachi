import { GenerateRandomSessionName } from "./name-generation";
import t from "tap";

t.test("#GenerateRandomSessionName", (t) => {
	const res = GenerateRandomSessionName();

	t.type(res, "string", "Should return a string.");

	t.end();
});
