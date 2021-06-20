import t from "tap";
import { CalculateGradeDeltaIIDX } from "./util";

t.test("#CalculateGradeDeltaIIDX", (t) => {
	t.equal(CalculateGradeDeltaIIDX("A", 1000, 2000), "A-334");
	t.equal(CalculateGradeDeltaIIDX("AAA", 1778, 2000), "AAA+0");
	t.equal(CalculateGradeDeltaIIDX("MAX", 1900, 2000), "MAX-100");

	t.end();
});
