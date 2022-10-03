import { BMS_TABLES } from "./bms-tables";
import t from "tap";

t.test("BMS Tables should be unique.", (t) => {
	const allKeys = BMS_TABLES.map((e) => `${e.playtype}-${e.prefix}`);

	t.strictSame(allKeys, [...new Set(allKeys)], "There should be no duplicate tables prefixes.");

	t.end();
});
