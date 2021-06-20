import t from "tap";

import * as tachiCommon from "./index";

// we just check that we're exporting stuff properly
t.test("Property Checks", (t) => {
	t.type(tachiCommon.GetGameConfig, "function");
	t.type(tachiCommon.GetGamePTConfig, "function");
	t.type(tachiCommon.gameClasses, "object");
	t.type(tachiCommon.COLOUR_SET, "object");

	t.end();
});
