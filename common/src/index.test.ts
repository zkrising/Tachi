import * as tachiCommon from "./index";
import t from "tap";

// we just check that we're exporting stuff properly
t.test("Property Checks", (t) => {
	t.type(tachiCommon.GetGameConfig, "function");
	t.type(tachiCommon.GetGamePTConfig, "function");
	t.type(tachiCommon.COLOUR_SET, "object");

	t.end();
});
