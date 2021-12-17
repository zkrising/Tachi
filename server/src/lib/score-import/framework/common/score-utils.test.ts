import t from "tap";
import { GetGradeFromPercent } from "./score-utils";

t.test("#GetGradeForPercent", (t) => {
	t.equal(
		GetGradeFromPercent("chunithm", "Single", 101),
		"SSS",
		"Should return SSS for the edge case of chunithms 101% == SS."
	);
	t.equal(
		GetGradeFromPercent("iidx", "SP", 100),
		"MAX",
		"Should return SSS for the edge case of 100% == MAX (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "DP", 100),
		"MAX",
		"Should return SSS for the edge case of 100% == MAX (iidx DP)."
	);

	t.equal(
		GetGradeFromPercent("iidx", "SP", 0),
		"F",
		"Should return SSS for the edge case of 0% == F (iidx SP)."
	);
	t.equal(
		GetGradeFromPercent("iidx", "DP", 0),
		"F",
		"Should return SSS for the edge case of 0% == F (iidx DP)."
	);

	t.end();
});
