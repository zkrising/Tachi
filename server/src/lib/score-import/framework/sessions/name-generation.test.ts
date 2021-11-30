import t from "tap";
import { GenerateRandomSessionName } from "./name-generation";

t.test("#GenerateRandomSessionName", (t) => {
	const res = GenerateRandomSessionName();

	t.type(res, "string", "Should return a string.");

	t.end();
});
